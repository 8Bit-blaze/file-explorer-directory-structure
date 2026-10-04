from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from tree import FileSystemTree
import json
import os
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

STORAGE_FILE = os.path.join(BASE_DIR, "storage.json")

fs = FileSystemTree()

with open(STORAGE_FILE, "r") as file:
    data = json.load(file)

fs.load_dict(data)

def save_tree():
    temp_file = STORAGE_FILE + ".tmp"

    with open(temp_file, "w", encoding="utf-8") as file:
        json.dump(fs.to_dict(), file, indent=4)

    os.replace(temp_file, STORAGE_FILE)

def validate_name(name):
    if not isinstance(name, str):
        return False

    name = name.strip()

    if not name:
        return False

    if name in [".", ".."]:
        return False

    invalid_characters = '<>:"/\\|?*'

    if any(char in name for char in invalid_characters):
        return False

    return True

        
@app.route("/")
def home():
    return jsonify({
        "message": "File Explorer API is running"
    })


@app.route("/tree")
def get_tree():
    return jsonify(fs.to_dict())

@app.route("/folder", methods=["POST"])
def create_folder():
    data = request.json

    parent_path = data["parent"]
    folder_name = data["name"]
    if not validate_name(folder_name):
        return jsonify({
            "error": "Invalid folder name"
        }), 400

    parent = fs.find_by_path(parent_path)

    if parent is None:
        return jsonify({
            "error": "Parent folder not found"
        }), 404

    folder = fs.create_folder(parent, folder_name)

    if folder is None:
        return jsonify({
            "error": "A folder with that name already exists"
        }), 409

    save_tree()

    return jsonify({
        "message": "Folder created",
        "name": folder.name,
        "type": folder.node_type,
        "path": fs.get_path(folder)
    }), 201


@app.route("/file", methods=["POST"])
def create_file():
    data = request.json

    parent_path = data["parent"]
    file_name = data["name"]
    file_content = data.get("content", "")

    if not validate_name(file_name):
        return jsonify({
            "error": "Invalid file name"
        }), 400

    parent = fs.find_by_path(parent_path)

    if parent is None:
        return jsonify({"error": "Parent folder not found"}), 404

    file = fs.create_file(parent, file_name, file_content)

    if file is None:
        return jsonify({
            "error": "A file or folder with that name already exists"
        }), 409

    save_tree()

    return jsonify({
        "message": "File created",
        "name": file.name,
        "type": file.node_type,
        "size": fs.get_file_size(file)
    }), 201

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    uploaded_file = request.files["file"]
    parent_path = request.form.get("parent")

    if not parent_path:
        return jsonify({"error": "Parent folder path is required"}), 400

    parent = fs.find_by_path(parent_path)

    if parent is None:
        return jsonify({"error": "Parent folder not found"}), 404

    if parent.node_type != "folder":
        return jsonify({"error": "Parent must be a folder"}), 400

    if not uploaded_file.filename:
        return jsonify({"error": "File name is required"}), 400

    original_name = uploaded_file.filename

    if not validate_name(original_name):
        return jsonify({
            "error": "Invalid file name"
        }), 400

    file_name = secure_filename(original_name)

    if not file_name:
        return jsonify({
            "error": "Invalid file name"
        }), 400

    # Prevent duplicate names in the same folder
    for child in parent.children:
        if child.name == file_name:
            return jsonify({
                "error": "A file or folder with that name already exists"
            }), 409

    stored_name = f"{uuid.uuid4().hex}_{file_name}"

    uploaded_file.save(
        os.path.join(UPLOAD_FOLDER, stored_name)
    )

    file = fs.create_file(
        parent,
        file_name,
        "",
        stored_name
    )

    save_tree()

    return jsonify({
        "message": "File uploaded",
        "name": file.name,
        "type": file.node_type,
        "path": fs.get_path(file),
        "stored_name": stored_name
    }), 201

@app.route("/download", methods=["GET"])
def download_file():
    path = request.args.get("path")

    if not path:
        return jsonify({"error": "Path is required"}), 400

    file = fs.find_by_path(path)

    if file is None:
        return jsonify({"error": "File not found"}), 404

    if file.node_type != "file":
        return jsonify({"error": "Selected item is not a file"}), 400

    if file.stored_name is None:
        return jsonify({
            "error": "This file is a text file and has no uploaded file"
        }), 400

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.stored_name
    )

    if not os.path.exists(file_path):
        return jsonify({
            "error": "Uploaded file is missing from storage"
        }), 404

    return send_from_directory(
        UPLOAD_FOLDER,
        file.stored_name,
        as_attachment=True,
        download_name=file.name
    )

@app.route("/file", methods=["GET"])
def get_file():
    path = request.args.get("path")

    if not path:
        return jsonify({"error": "Path is required"}), 400

    file = fs.find_by_path(path)

    if file is None:
        return jsonify({"error": "File not found"}), 404

    if file.node_type != "file":
        return jsonify({"error": "Selected item is not a file"}), 400

    if file.stored_name is not None:
        return jsonify({
            "error": "Uploaded binary files cannot be opened in the text editor"}), 400

    return jsonify({
        "name": file.name,
        "path": path,
        "content": file.content,
        "size": fs.get_file_size(file)
    })

@app.route("/file", methods=["PUT"])
def update_file():
    data = request.json

    path = data["path"]
    content = data.get("content", "")

    file = fs.find_by_path(path)

    if file is None:
        return jsonify({"error": "File not found"}), 404

    if file.node_type != "file":
        return jsonify({"error": "Selected item is not a file"}), 400

    if file.stored_name is not None:
        return jsonify({
            "error": "Uploaded binary files cannot be edited as text"}), 400

    file.content = content

    save_tree()

    return jsonify({
        "message": "File updated",
        "name": file.name,
        "path": path,
        "size": fs.get_file_size(file)
    })

@app.route("/delete", methods=["DELETE"])
def delete_item():
    data = request.json
    path = data["path"]

    item = fs.find_by_path(path)

    if item is None:
        return jsonify({"error": "Item not found"}), 404

    if item is fs.root:
        return jsonify({"error": "The root folder cannot be deleted"}), 400

    parent_path = "/".join(path.rstrip("/").split("/")[:-1])

    if parent_path == "":
        parent_path = "/root"

    parent = fs.find_by_path(parent_path)

    if parent is None:
        return jsonify({"error": "Parent folder not found"}), 404

    parent.children.remove(item)
    
    # Delete the physical uploaded file if one exists
    if item.node_type == "file" and item.stored_name is not None:
        file_path = os.path.join(
            UPLOAD_FOLDER,
            item.stored_name
        )

        if os.path.exists(file_path):
            os.remove(file_path)
    
    save_tree()



    return jsonify({
        "message": "Item deleted",
        "path": path
    })

@app.route("/rename", methods=["PUT"])
def rename_item():
    data = request.json

    path = data["path"]
    new_name = data["new_name"]
    if not validate_name(new_name):
        return jsonify({
            "error": "Invalid name"
        }), 400

    
    item = fs.find_by_path(path)

    if item is None:
        return jsonify({"error": "Item not found"}), 404

    if item is fs.root:
        return jsonify({"error": "The root folder cannot be renamed"}), 400

    parent_path = "/".join(path.rstrip("/").split("/")[:-1])

    if parent_path == "":
        parent_path = "/root"

    parent = fs.find_by_path(parent_path)

    if parent is None:
        return jsonify({"error": "Parent folder not found"}), 404

    for child in parent.children:
        if child is not item and child.name == new_name:
            return jsonify({
                "error": "An item with that name already exists"
            }), 409

    item.name = new_name

    save_tree()

    return jsonify({
        "message": "Item renamed",
        "old_path": path,
        "new_name": new_name
    })

@app.route("/search", methods=["GET"])
def search_item():
    name = request.args.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    items = fs.search_all(name)

    if not items:
        return jsonify({"error": "Item not found"}), 404

    results = []

    for item in items:
        result = {
            "name": item.name,
            "type": item.node_type,
            "path": fs.get_path(item)
        }

        if item.node_type == "file":
            result["size"] = fs.get_file_size(item)

        results.append(result)

    return jsonify({
        "results": results
    })

@app.route("/storage", methods=["GET"])
def get_storage():
    total_size = fs.calculate_size()

    return jsonify({
        "total_size": total_size,
        "unit": "bytes"
    })

if __name__ == "__main__":
    app.run(debug=True)
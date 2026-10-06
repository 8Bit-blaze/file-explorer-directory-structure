class Node:
    def __init__(self, name, node_type, content="", stored_name=None):
        self.name = name
        self.node_type = node_type
        self.content = content
        self.stored_name = stored_name
        self.children = []

class FileSystemTree:
    def __init__(self):
        self.root = Node("root", "folder")

    def create_folder(self, parent, name):
        for child in parent.children:
            if child.name == name:
                return None

        folder = Node(name, "folder")
        parent.children.append(folder)
        return folder
    
    def create_file(self, parent, name, content="", stored_name=None):
        for child in parent.children:
            if child.name == name:
                return None

        file = Node(name, "file", content, stored_name)
        parent.children.append(file)
        return file

    def get_file_size(self, node):
        if node.node_type != "file":
            return 0

        if node.stored_name is not None:
            import os
            
            upload_folder = os.environ.get(
                "UPLOAD_FOLDER",
                os.path.join(
                    os.path.dirname(os.path.abspath(__file__)),
                    "uploads"
                )
            )


            file_path = os.path.join(
                upload_folder,
                node.stored_name
            )

            if os.path.exists(file_path):
                return os.path.getsize(file_path)

            return 0

        return len(node.content.encode("utf-8"))

    def display_tree(self, node=None, level=0):
        if node is None:
            node = self.root

        print("  " * level + node.name)

        for child in node.children:
            self.display_tree(child, level + 1)

    def search(self, name, node=None):
        if node is None:
            node = self.root

        if node.name == name:
            return node

        for child in node.children:
            result = self.search(name, child)

            if result is not None:
                return result

        return None 

    
    def search_all(self, name, node=None):
        if node is None:
            node = self.root

        results = []

        if name.lower() in node.name.lower():
            results.append(node)

        for child in node.children:
            results.extend(self.search_all(name, child))

        return results
    
    def find_by_path(self, path):
        if path == "/" or path == "/root":
            return self.root

        parts = path.strip("/").split("/")

        if parts[0] == "root":
            parts = parts[1:]

        current = self.root

        for part in parts:
            found = None

            for child in current.children:
                if child.name == part:
                    found = child
                    break

            if found is None:
                return None

            current = found

        return current
    def get_path(self, target, node=None, path=""):
        if node is None:
            node = self.root
            path = "/root"

        if node is target:
            return path

        for child in node.children:
            child_path = f"{path}/{child.name}"

            result = self.get_path(target, child, child_path)

            if result is not None:
                return result

        return None       
    
    def delete(self, name, node=None):
        if node is None:
            node = self.root

        for child in node.children:
            if child.name == name:
                node.children.remove(child)
                return True

            if self.delete(name, child):
                return True

        return False
    
    def rename(self, old_name, new_name, node=None):
        if node is None:
            node = self.root

        if node.name == old_name:
            node.name = new_name
            return True

        for child in node.children:
            if self.rename(old_name, new_name, child):
                return True

        return False

    def calculate_size(self, node=None):
        if node is None:
            node = self.root

        if node.node_type == "file":
            return self.get_file_size(node)

        total = 0

        for child in node.children:
            total += self.calculate_size(child)

        return total

    def to_dict(self, node=None):
        if node is None:
            node = self.root

        result = {
            "name": node.name,
            "type": node.node_type
        }

        if node.node_type == "file":
            result["content"] = node.content
            result["size"] = self.get_file_size(node)

            if node.stored_name is not None:
                result["stored_name"] = node.stored_name

        if node.children:
            result["children"] = []

            for child in node.children:
                result["children"].append(self.to_dict(child))

        return result
    
    def load_dict(self, data, parent=None):
        if parent is None:
            parent = self.root

        for item in data.get("children", []):
            node_type = item["type"]
            name = item["name"]

            if node_type == "folder":
                node = self.create_folder(parent, name)
                self.load_dict(item, node)

            elif node_type == "file":
                content = item.get("content", "")
                stored_name = item.get("stored_name")

                # Support old storage format
                if "content" not in item and "size" in item:
                    content = ""

                self.create_file(
                    parent,
                    name,
                    content,
                    stored_name
                )



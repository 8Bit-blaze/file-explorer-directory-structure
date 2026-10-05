
# File Explorer — Directory Structure

A web-based **File Explorer simulation** built using a **Tree data structure** to represent folders and files. The project provides a graphical interface for creating, managing, searching, uploading, downloading, and editing files within a hierarchical directory structure.

## Project Overview

This project demonstrates how a **Tree data structure** can be used to model a file-system-like directory structure.

Each folder is represented as a tree node that can contain child folders or files. The backend maintains the tree as the single source of truth, while the frontend visualizes and interacts with it.

The project runs using a Flask backend and a browser-based frontend.

## Features

- Tree-based directory structure
- Create folders
- Create text files
- Rename files and folders
- Delete files and folders
- Search files and folders
- Upload files
- Download uploaded files
- Edit text-file contents
- Calculate file and folder sizes
- Expand/collapse folders
- Persistent tree state using JSON storage
- Light/Dark theme
- Frontend-backend API integration
- File-name validation
- Unique physical names for uploaded files
- CORS support for frontend-backend communication

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- Flask
- Flask-CORS

### Data Structure

- Tree

### Storage

- `storage.json` — stores the directory tree
- `uploads/` — stores uploaded physical files

## Project Structure

```text
File Explorer/
│
├── backend/
│   ├── .gitignore
│   ├── PROJECT_STATUS.md
│   ├── app.py
│   ├── storage.json
│   ├── tree.py
│   └── uploads/
│
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── .gitignore
└── README.md
```

## Architecture

```text
                ┌──────────────────────┐
                │      Frontend        │
                │  HTML / CSS / JS     │
                └──────────┬───────────┘
                           │
                       HTTP API
                           │
                           ▼
                ┌──────────────────────┐
                │       Flask          │
                │      Backend         │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │    FileSystemTree    │
                │       (Tree)         │
                └──────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌──────────────┐          ┌──────────────┐
       │ storage.json │          │   uploads/   │
       │ Tree state   │          │ Actual files │
       └──────────────┘          └──────────────┘
```

## Tree Data Structure

The core of the project is the `FileSystemTree` class located in:

```text
backend/tree.py
```

Each node contains information such as:

```text
name
node_type
content
stored_name
children
```

Folders can contain multiple child nodes, while files contain their content and metadata.

Example:

```text
Root
├── Documents
│   ├── Resume.txt
│   └── Notes.txt
│
├── Pictures
│   ├── image1.png
│   └── image2.jpg
│
└── Projects
    └── File Explorer
```

The Tree structure is used for creating, deleting, renaming, searching, and calculating the size of files and directories.

## Persistence

The current tree state is stored in:

```text
backend/storage.json
```

When the Flask application starts, it loads the saved tree.

After operations that modify the directory structure, the backend saves the updated tree back to the JSON file.

Uploaded binary files are stored separately in:

```text
backend/uploads/
```

The tree stores a unique `stored_name` for uploaded files so that the physical file and its displayed file name can be managed independently.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health check |
| GET | `/tree` | Get the complete directory tree |
| POST | `/folder` | Create a folder |
| POST | `/file` | Create a text file |
| GET | `/file` | Read a text file |
| PUT | `/file` | Update a text file |
| POST | `/upload` | Upload a physical file |
| GET | `/download` | Download an uploaded file |
| DELETE | `/delete` | Delete a file or folder |
| PUT | `/rename` | Rename a file or folder |
| GET | `/search` | Search the directory tree |

## Running the Project Locally

### 1. Create the virtual environment

From the project root:

```bash
python -m venv .venv
```

### 2. Activate the virtual environment

On Windows:

```bash
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install Flask Flask-Cors
```

### 4. Start the backend

```bash
cd backend
python app.py
```

The backend runs at:

```text
http://127.0.0.1:5000
```

### 5. Open the frontend

Open:

```text
frontend/index.html
```

in your browser.

The frontend communicates with the Flask backend through its API.

## Important Design Principle

The **Tree is the single source of truth** for the logical file system.

The frontend does not independently maintain a separate directory structure.

The data flow is:

```text
User Action
     ↓
Frontend
     ↓
Flask API
     ↓
FileSystemTree
     ↓
storage.json
     ↓
Updated Tree
     ↓
Frontend Refresh
```

This keeps the frontend representation synchronized with the backend data structure.

## File Storage Model

There are two types of files in the system.

### Text Files

Text files are represented directly inside the tree and their content is stored in `storage.json`.

### Uploaded Files

Uploaded binary files are stored physically inside:

```text
backend/uploads/
```

The tree stores metadata and the unique physical storage name.

This separation allows the application to support files that cannot be represented safely as plain text.

## Validation and Safety

The backend validates file and folder names before performing operations.

Invalid names containing characters such as:

```text
< > : " / \ | ? *
```

are rejected.

Uploaded filenames are processed using Flask/Werkzeug's secure filename handling.

Uploaded files receive unique physical storage names to prevent filename collisions.

## Current Status

The core File Explorer functionality is complete.

Implemented components include:

- Tree data structure
- Flask backend
- REST-style API
- JSON persistence
- Physical file uploads
- File downloads
- File deletion
- Folder deletion
- Rename operations
- Text-file editing
- Search
- Dynamic frontend tree
- Expand/collapse folders
- Light/dark theme
- Storage calculation
- Git/GitHub version control

## Future Improvements

Possible future improvements include:

- Persistent cloud storage
- Database-backed file metadata
- User authentication
- Multiple users
- Access permissions
- Drag-and-drop file movement
- File preview
- Breadcrumb navigation
- Cloud deployment
- Production configuration

## Author

**8Bit-blaze**

## License

This project is currently intended as an educational and portfolio project.

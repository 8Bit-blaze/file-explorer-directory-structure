# File Explorer Directory Structure — Project Status

## 1. Project Overview

**Project Name:** File Explorer Directory Structure

The project is a simulated File Explorer application built to demonstrate and use a **Tree data structure** for representing a hierarchical file and folder system.

The application has:

- A web-based frontend
- A Python Flask backend
- A Tree-based directory structure
- JSON persistence
- Local physical storage for uploaded binary files
- File and folder management operations
- Search
- Text-file editing
- Upload and download functionality
- Light and dark themes

The project is currently being developed and tested locally before any deployment.

---

# 2. Technology Stack

## Frontend

- HTML
- CSS
- JavaScript

## Backend

- Python
- Flask
- Flask-CORS

## Data Structure

- Tree
- Node-based hierarchical structure

## Persistence

- JSON
- `backend/storage.json`

## Physical File Storage

- `backend/uploads/`

## Development Environment

- Localhost
- Python virtual environment: `.venv`

---

# 3. Core Project Principle

The **Tree data structure is the central principle of the project**.

The directory hierarchy is represented as a Tree:

```text
root
├── Folder
│   ├── Folder
│   │   └── File
│   └── File
└── Folder
```

Each file or folder is represented by a `Node`.

The Tree is responsible for:

- Directory hierarchy
- Parent-child relationships
- Folder creation
- File creation
- File lookup
- Path generation
- Searching
- Deletion
- Renaming
- Storage calculation
- Persistence conversion

The backend Tree is the **single source of truth** for the directory structure.

The frontend does not create an independent directory structure. It receives the Tree from the Flask backend and renders it.

---

# 4. Current Development Phase

## Phase 2 — Frontend

The project has progressed from the backend and data-structure implementation into frontend development and integration testing.

Current focus:

- Frontend UI
- Tree visualization
- Tree-based sidebar
- Folder navigation
- File operations
- Search
- File editing
- Upload/download
- Theme system
- Backend/frontend integration
- Testing and refinement

---

# 5. Project Environment

Completed:

- Python installed
- Virtual environment created
- Flask installed
- Flask-CORS installed
- Backend configured
- Frontend created
- Local Flask server tested successfully
- Root `.venv` established as the project virtual environment

The old duplicate backend virtual environment was removed.

Current virtual environment:

```text
C:\File Explorer\.venv\
```

---

# 6. Current Project Structure

```text
C:\File Explorer\
│
├── .venv\
│
├── PROJECT_STATUS.md
│
├── backend\
│   ├── __pycache__\
│   ├── app.py
│   ├── tree.py
│   ├── storage.json
│   └── uploads\
│
└── frontend\
    ├── index.html
    ├── script.js
    └── style.css
```

---

# 7. Tree / Data Structure Implementation

The Tree implementation is located in:

```text
backend/tree.py
```

The main components are:

- `Node`
- `FileSystemTree`

## Node

A Node represents either:

- Folder
- File

A Node stores information such as:

- Name
- Node type
- Content
- Stored physical filename for uploaded files
- Children

Files can contain text content directly in the Tree.

Uploaded binary files store their physical filename as metadata while the actual binary data remains in `uploads/`.

---

# 8. Tree Features Completed

The following Tree operations are implemented:

- Root node
- Folder nodes
- File nodes
- Create folder
- Create text file
- Nested folders
- Parent-child relationships
- Recursive Tree traversal
- Find node by path
- Generate node path
- Search Tree recursively
- Delete nodes
- Rename nodes
- Calculate storage size
- Convert Tree to dictionary
- Reconstruct Tree from dictionary
- Store text-file content
- Store uploaded-file metadata
- Calculate physical uploaded-file size

---

# 9. Path System

The project uses paths such as:

```text
/root
/root/My Documents
/root/My Documents/My Projects
/root/My Documents/My Projects/hello.txt
```

The Tree supports path-based lookup.

Examples:

```text
/root
/root/Downloads
/root/My Documents
/root/My Documents/My Projects
```

This allows the Flask API and frontend to operate on specific files and folders without relying on frontend-only references.

---

# 10. Flask Backend

The backend is implemented in:

```text
backend/app.py
```

The Flask backend provides the API used by the frontend.

Flask-CORS is enabled so the frontend can communicate with the backend during local development.

---

# 11. Flask API

## Basic API

### `GET /`

Checks whether the Flask API is running.

Response:

```json
{
    "message": "File Explorer API is running"
}
```

### `GET /tree`

Returns the complete directory Tree.

The frontend uses this endpoint as the main source for rendering the file system.

---

# 12. Folder Operations

## `POST /folder`

Creates a new folder.

Input contains:

```json
{
    "parent": "/root",
    "name": "Documents"
}
```

The backend:

1. Finds the parent folder
2. Checks for duplicate names
3. Creates a Tree node
4. Saves the updated Tree to JSON
5. Returns the created folder information

Duplicate names are rejected.

---

# 13. File Operations

## `POST /file`

Creates a text file.

Example:

```json
{
    "parent": "/root/Documents",
    "name": "notes.txt",
    "content": "Hello World"
}
```

Text-file content is stored directly in the Tree and persisted to JSON.

---

## `GET /file`

Reads a text file.

The endpoint returns:

- File name
- Path
- Content
- Size

---

## `PUT /file`

Updates the content of a text file.

Example:

```json
{
    "path": "/root/Documents/notes.txt",
    "content": "Updated content"
}
```

The updated content is saved to the Tree and then persisted to JSON.

---

# 14. Delete Operation

## `DELETE /delete`

Deletes a file or folder.

The backend:

1. Finds the node using its path
2. Prevents deletion of the root
3. Removes the node from its parent's children
4. If the item is an uploaded binary file, deletes the physical file
5. Saves the updated Tree

This keeps the Tree and physical uploaded-file storage synchronized.

---

# 15. Rename Operation

## `PUT /rename`

Renames a file or folder.

Example:

```json
{
    "path": "/root/Documents/old.txt",
    "new_name": "new.txt"
}
```

The backend:

- Finds the item
- Prevents renaming the root
- Checks duplicate names in the same parent
- Changes the node name
- Saves the updated Tree

---

# 16. Search

## `GET /search`

Searches the Tree recursively.

The search supports partial name matching.

For example:

```text
Search: project
```

Can find:

```text
My Projects
project_notes.txt
Project Report.pdf
```

The search result includes:

- Name
- Type
- Path
- File size when applicable

A previous bug caused the search route to access a nonexistent `item.size` property.

This was fixed by calculating file size through:

```python
fs.get_file_size(item)
```

Search is now compatible with both text files and uploaded files.

---

# 17. Storage Calculation

## `GET /storage`

Calculates the total storage used by files in the Tree.

The result is returned in bytes.

Example:

```json
{
    "total_size": 751626,
    "unit": "bytes"
}
```

For text files, size is calculated from their encoded text content.

For uploaded files, size is calculated from the physical file in:

```text
backend/uploads/
```

---

# 18. JSON Persistence

The project uses:

```text
backend/storage.json
```

for persistence.

The Tree is converted into a JSON-compatible structure when saved.

On backend startup:

1. Flask starts
2. `storage.json` is read
3. The Tree is reconstructed
4. The application continues using the reconstructed Tree

This means data survives Flask restarts.

---

# 19. Persistence Features Completed

Persistence has been tested for:

- Folder creation
- File creation
- File content
- Nested folders
- Rename
- Delete
- Uploaded-file metadata
- Storage information
- Tree reconstruction after restart

The directory structure is therefore not lost when the Flask server restarts.

---

# 20. Physical File Storage

Binary uploads are not stored directly inside JSON.

Instead:

```text
backend/
└── uploads/
```

stores the actual binary files.

The Tree stores metadata such as:

```text
Original filename
Stored filename
File type
File size
```

Example:

```json
{
    "name": "image.png",
    "type": "file",
    "content": "",
    "stored_name": "unique_generated_name_image.png",
    "size": 751626
}
```

This separates:

- Directory metadata → Tree / JSON
- Binary data → `uploads/`

---

# 21. Upload Feature

## `POST /upload`

The upload system allows the frontend to send a physical file to the backend.

Workflow:

```text
Browser
   │
   ▼
File Upload
   │
   ▼
Flask /upload
   │
   ▼
backend/uploads/
   │
   ▼
Tree metadata
   │
   ▼
storage.json
```

The backend generates a unique stored filename to reduce filename collisions.

The original filename is retained as the Tree node name.

---

# 22. Download Feature

## `GET /download`

Uploaded binary files can be downloaded.

The backend:

1. Finds the Tree node
2. Checks that it is a file
3. Checks that it has physical upload metadata
4. Sends the stored physical file
5. Uses the original file name for the download

Text files do not use the binary download endpoint.

---

# 23. Uploaded File Delete

Deleting an uploaded file performs both operations:

```text
Tree node
   ↓
Removed

Physical file
   ↓
Removed
```

The updated Tree is then saved to:

```text
backend/storage.json
```

Storage usage is recalculated.

This prevents orphaned uploaded files from remaining after deletion.

---

# 24. Frontend

The frontend is located in:

```text
frontend/
```

Files:

```text
index.html
script.js
style.css
```

The frontend communicates with Flask using HTTP API requests.

Current API base:

```text
http://127.0.0.1:5000
```

---

# 25. Frontend HTML

The HTML interface contains:

- Application header
- File Explorer branding
- Theme controls
- Sidebar
- Toolbar
- Search box
- Main Tree panel
- Selected Item panel
- File Editor
- Storage panel
- Upload input
- File operation buttons

Main UI areas:

```text
Header
├── Branding
└── Theme Controls

Main Layout
├── Sidebar
└── Main Content
    ├── Toolbar
    └── Workspace
        ├── File Tree
        └── Right Panel
            ├── Selected Item
            ├── File Editor
            └── Storage
```

---

# 26. Frontend Tree Rendering

The main file view is dynamically generated from the Tree returned by:

```text
GET /tree
```

The JavaScript recursively renders folders and files.

Example:

```text
▼ 📁 root
   ▼ 📁 My Documents
      ▼ 📁 My Projects
         📄 hello.txt
      ▶ 📁 Test Projects
   ▶ 📁 Downloads
```

The Tree is not hard-coded in HTML.

---

# 27. Tree Expansion / Collapse

Folder expansion and collapse are implemented.

The frontend maintains:

```javascript
expandedFolders
```

This is a UI state only.

It does not replace the actual backend Tree.

Both the main Tree and sidebar support expansion/collapse.

---

# 28. Tree-Based Sidebar

The sidebar is generated recursively from the same Tree data.

It is not a separate hard-coded directory list.

This means when the backend Tree changes:

- New folders appear
- Deleted folders disappear
- Renamed folders update
- Nested folders appear automatically
- Files appear automatically

The sidebar and main Tree therefore remain synchronized.

---

# 29. Single Source of Truth

The project follows this architecture:

```text
              Flask Backend
                    │
                    ▼
             FileSystemTree
                    │
                    ▼
               /tree API
                    │
             ┌──────┴──────┐
             │             │
             ▼             ▼
         Main Tree      Sidebar
```

The frontend uses the backend Tree rather than maintaining a second directory database.

---

# 30. Folder Navigation

Clicking a folder allows it to become the current selected folder.

The current path is displayed in the interface.

Example:

```text
/root
/root/My Documents
/root/My Documents/My Projects
```

This selected folder is used as the target for new folder and file creation.

---

# 31. Selected Item Panel

The frontend displays information about the selected item.

Depending on the selection, the interface can show:

- Name
- Type
- Path
- File size
- Folder information

For uploaded files, the actual physical file size is displayed.

---

# 32. Text File Editor

Text-file editing is implemented.

Workflow:

```text
Create Text File
       ↓
Select/Open File
       ↓
Load Content
       ↓
Edit Content
       ↓
Save
       ↓
PUT /file
       ↓
Tree Updated
       ↓
storage.json Updated
```

The editor is disabled when no editable text file is selected.

---

# 33. Binary File Behavior

Uploaded binary files are not opened in the text editor.

For example:

```text
image.png
PDF
ZIP
other binary file
```

When an uploaded binary file is double-clicked, it is downloaded instead of being loaded into the text editor.

This prevents binary data from being treated as normal text.

---

# 34. File Creation

The frontend supports creating text files.

The user can:

1. Select a folder
2. Click New File
3. Enter a file name
4. Enter initial content
5. Create the file

The frontend sends the operation to:

```text
POST /file
```

The Tree is then refreshed.

---

# 35. Folder Creation

The frontend supports creating folders.

Workflow:

```text
Select Folder
    ↓
New Folder
    ↓
Enter Name
    ↓
POST /folder
    ↓
Tree Refresh
    ↓
Sidebar Refresh
```

---

# 36. Rename

The frontend provides a Rename button.

Rename operation:

```text
Select Item
    ↓
Rename
    ↓
Enter New Name
    ↓
PUT /rename
    ↓
Tree Refresh
```

Duplicate names are rejected by the backend.

---

# 37. Delete

The frontend provides a Delete button.

Workflow:

```text
Select Item
    ↓
Delete
    ↓
DELETE /delete
    ↓
Tree Updated
    ↓
Physical File Removed if Necessary
    ↓
Storage Updated
```

The root folder cannot be deleted.

---

# 38. Search UI

The frontend provides:

- Search input
- Search button
- Search results

Search requests are sent to:

```text
GET /search
```

Search results contain paths so the user can identify where an item is located.

Selecting a search result can navigate to the corresponding item and expand its parent folders.

---

# 39. Search Navigation

When a search result is selected, the frontend:

1. Finds the result path
2. Expands required parent folders
3. Selects the item
4. Updates the current path
5. Updates the selected-item panel

This makes search useful for navigating large nested Trees.

---

# 40. Theme System

The frontend supports:

- Light theme
- Dark theme

Theme state is saved using browser:

```text
localStorage
```

Therefore the selected theme remains after page refresh.

The theme affects:

- Header
- Sidebar
- Toolbar
- Tree
- Cards
- Editor
- Storage section
- Text
- Borders
- Hover states
- Selected states

---

# 41. Responsive Design

The CSS includes responsive behavior for smaller screen sizes.

The layout adapts the sidebar, workspace and right panel for narrower screens.

The frontend is designed primarily as a desktop-style File Explorer but includes responsive adjustments.

---

# 42. Frontend JavaScript State

The frontend currently maintains UI state such as:

```javascript
treeData
selectedFolder
selectedItem
selectedItemPath
currentEditorPath
expandedFolders
```

Important distinction:

```text
Backend Tree
    ↓
Actual directory structure

Frontend state
    ↓
Selection, expansion and UI state
```

The frontend does not replace the backend Tree.

---

# 43. Error Handling

The frontend and backend include error handling for cases such as:

- Missing parent folder
- Missing file
- Missing path
- Duplicate names
- Invalid folder
- Invalid file operation
- Root deletion
- Root rename
- Missing upload
- Invalid upload parent
- Invalid download request
- Text/binary file distinction

HTTP status codes are used for API errors.

Examples:

```text
400 — Invalid request
404 — Item not found
409 — Duplicate name
```

---

# 44. Testing Completed

The following functionality has been manually verified:

## Backend

- Flask starts successfully
- Root endpoint works
- Tree endpoint works
- Folder creation works
- File creation works
- Nested folder operations work
- Duplicate protection works
- Rename works
- Delete works
- Search works
- Storage calculation works
- Persistence after restart works

## Upload System

- PNG upload works
- Uploaded file appears in Tree
- Actual file size is displayed
- Download works
- Physical file is stored in `uploads/`
- Delete removes both Tree node and physical file
- Storage decreases after deletion

## Text Files

- Text file creation works
- Text content is saved
- Text file can be opened
- Text content can be edited
- File can be saved
- File can be closed
- File can be reopened
- Content persists after restart

## Frontend

- Tree renders dynamically
- Sidebar renders dynamically
- Folder expansion works
- Folder collapse works
- Search UI works
- Selected item information works
- Text editor works
- Upload/download UI works
- Delete UI works
- Rename UI works
- Storage display works
- Theme persistence works

---

# 45. Important Bugs Fixed

## Search Size Bug

Problem:

```python
item.size
```

was used even though `Node` did not have a `size` property.

This caused:

```text
AttributeError:
'Node' object has no attribute 'size'
```

Fix:

```python
fs.get_file_size(item)
```

---

## Uploaded File Size

The Tree initially needed support for calculating the actual size of uploaded physical files.

The implementation now checks the stored uploaded filename and calculates the physical file size from:

```text
backend/uploads/
```

This allows actual binary file sizes to be shown.

---

## Delete Uploaded Files

Deleting only the Tree node would leave the physical uploaded file behind.

The delete route was updated so that uploaded files are physically removed from `uploads/` as well.

---

## Duplicate Virtual Environments

An old:

```text
backend/venv/
```

directory existed.

It was removed so the project uses the root:

```text
.venv/
```

as the single development environment.

---

# 46. Current Architecture

```text
                         FILE EXPLORER
                              │
                    ┌─────────┴─────────┐
                    │                   │
                FRONTEND             BACKEND
                    │                   │
        ┌───────────┼───────────┐       │
        │           │           │       │
      Tree       Sidebar     Toolbar    │
        │           │           │       │
        └───────────┼───────────┘       │
                    │                   │
                  HTTP API              │
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                       FileSystemTree
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
           storage.json                uploads/
           Metadata/tree              Binary files
```

---

# 47. Current Data Flow

## Loading the Application

```text
Browser
   ↓
Frontend
   ↓
GET /tree
   ↓
Flask
   ↓
FileSystemTree
   ↓
JSON response
   ↓
Frontend renders Tree
```

## Creating a Folder

```text
User
   ↓
New Folder
   ↓
Frontend
   ↓
POST /folder
   ↓
FileSystemTree
   ↓
storage.json
   ↓
GET /tree
   ↓
Frontend refresh
```

## Uploading a File

```text
User
   ↓
Select File
   ↓
Frontend
   ↓
POST /upload
   ↓
Flask
   ├── uploads/ physical file
   └── Tree metadata
            ↓
       storage.json
```

---

# 48. Current Working State

The project is currently in a **working integrated state**.

Working major systems:

- Tree data structure
- Flask backend
- JSON persistence
- Physical file storage
- Folder management
- File management
- Search
- Rename
- Delete
- Text editor
- Upload
- Download
- Storage calculation
- Main Tree UI
- Tree-based sidebar
- Expand/collapse
- Theme system
- Frontend/backend communication

The project is now mainly in the **refinement, integration testing and finalization stage** rather than the initial implementation stage.

---

# 49. Current Task

## Phase 2 — Frontend Refinement and Integration Testing

Current priorities:

1. Verify all Tree operations through the UI
2. Verify sidebar navigation
3. Verify folder expansion/collapse
4. Verify search navigation
5. Verify text-file editing
6. Verify upload/download
7. Verify delete
8. Verify rename
9. Verify storage updates
10. Verify light/dark theme
11. Improve error messages
12. Improve selected-item display
13. Improve responsive behavior
14. Test edge cases
15. Clean up frontend behavior

---

# 50. Next Phase — Testing

After frontend refinement, the project should move into a dedicated testing phase.

Planned testing:

## Tree Testing

- Root behavior
- Folder creation
- File creation
- Nested folders
- Duplicate names
- Search
- Rename
- Delete
- Path lookup
- Path generation
- Storage calculation

## API Testing

- `GET /`
- `GET /tree`
- `POST /folder`
- `POST /file`
- `GET /file`
- `PUT /file`
- `DELETE /delete`
- `PUT /rename`
- `GET /search`
- `GET /storage`
- `POST /upload`
- `GET /download`

## Persistence Testing

- Save
- Restart
- Reload
- Verify Tree reconstruction
- Verify text content
- Verify uploaded-file metadata

## Frontend Testing

- Navigation
- Selection
- Expansion
- Collapse
- Search
- Editor
- Upload
- Download
- Delete
- Rename
- Theme
- Responsive layout

---

# 51. Edge Cases to Test

Important edge cases include:

- Empty root
- Empty folders
- Deeply nested folders
- Duplicate file names
- Duplicate folder names
- File and folder with the same name
- Rename to an existing name
- Delete root
- Rename root
- Delete non-existent path
- Open non-existent file
- Upload with no file
- Upload into a file
- Download a text file
- Download missing uploaded file
- Very large file
- Empty text file
- File names containing spaces
- File names containing special characters
- Search with no results
- Search with partial names
- Search with multiple matching items
- Restart after upload
- Restart after delete

---

# 52. Phase 3 — Finalization

After testing:

1. Clean project structure
2. Remove unused code
3. Improve UI
4. Improve documentation
5. Add comments where useful
6. Prepare demonstration
7. Prepare project report
8. Prepare screenshots
9. Complete final integration testing
10. Plan deployment

---

# 53. Future Deployment

Deployment is intentionally postponed until the local version is stable.

Current priority:

```text
Localhost
   ↓
Testing
   ↓
Refinement
   ↓
Finalization
   ↓
Deployment
```

The project should not move to deployment before core functionality is fully tested.

---

# 54. Important Design Decisions

The following decisions are fixed project principles:

- The project is a simulated File Explorer
- Tree is the primary data structure
- Flask is the backend
- HTML/CSS/JavaScript are used for the frontend
- Flask-CORS is used for frontend/backend communication
- JSON is used for persistence
- Uploaded binary files are stored in `uploads/`
- Tree stores metadata for uploaded binary files
- Text content is stored directly in the Tree/JSON
- Localhost development comes before deployment
- Backend Tree is the single source of truth
- Sidebar is generated from the actual Tree
- Main Tree and sidebar use the same Tree data
- Frontend expansion state is separate from actual directory data
- Uploaded binary files are not edited as text
- Uploaded files can be downloaded
- Deleting an uploaded file also removes its physical file

---

# 55. Design Principle Going Forward

All future features should follow this architecture:

```text
                         TREE
                          │
                ┌─────────┴─────────┐
                │                   │
             Backend             Frontend
                │                   │
                │            ┌──────┴──────┐
                │            │             │
                │        Main Tree      Sidebar
                │
                ▼
          storage.json
                +
            uploads/
```

The **Tree remains the central data structure**.

New frontend features should operate on the backend Tree through the API instead of creating a separate directory-management system.

---

# 56. Final Project Status Summary

```text
Project: File Explorer Directory Structure

Backend:                 WORKING
Tree Data Structure:     WORKING
Flask API:               WORKING
JSON Persistence:        WORKING
Physical Uploads:        WORKING
Download:                WORKING
Delete:                  WORKING
Rename:                  WORKING
Search:                  WORKING
Text Editor:             WORKING
Main Tree UI:            WORKING
Sidebar Tree:            WORKING
Expand/Collapse:         WORKING
Theme System:            WORKING
Frontend Integration:    WORKING

Current Phase:           Phase 2 — Frontend Refinement
Next Phase:              Testing
Final Phase:             Documentation + Deployment
```

## Overall Status

**The core File Explorer system is implemented and working.**

The major remaining work is:

- Integration testing
- Edge-case testing
- UI/UX refinement
- Documentation
- Final demonstration preparation
- Deployment planning

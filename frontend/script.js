const API_URL = "http://127.0.0.1:5000";


let treeData = null;

let selectedFolder = "/root";

let selectedItem = null;

let selectedItemPath = null;

let currentEditorPath = null;


const expandedFolders = new Set([
    "/root"
]);

async function initialize() {

    setupTheme();

    setupEventListeners();

    await loadTree();

    await loadStorage();

}

async function loadTree() {

    try {

        const response =
            await fetch(
                `${API_URL}/tree`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load tree"
            );

        }


        const data =
            await response.json();


        treeData = data;

        expandedFolders.add("/root");

        renderTree(treeData);

        renderSidebar(treeData);

        updateCurrentPath();


    } catch (error) {

        console.error(error);


        document.getElementById(
            "tree-container"
        ).innerHTML = `
            <p class="error-message">
                Unable to connect to
                File Explorer backend.
            </p>
        `;


        document.getElementById(
            "sidebar-tree"
        ).innerHTML = `
            <p class="error-message">
                Backend unavailable
            </p>
        `;

    }

}

function renderTree(root) {

    const container =
        document.getElementById(
            "tree-container"
        );


    container.innerHTML = "";


    renderNode(
        root,
        container,
        0,
        "/root"
    );

}

function renderNode(
    node,
    container,
    level,
    path
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "tree-item";


    if (
        selectedItemPath === path
    ) {

        item.classList.add(
            "selected"
        );

    }


    item.style.paddingLeft =
        `${10 + level * 22}px`;


    const isFolder =
        node.type === "folder";


    const isExpanded =
        expandedFolders.has(path);


    const arrow =
        isFolder
            ? (
                isExpanded
                    ? "▼"
                    : "▶"
            )
            : "";


    const icon =
        isFolder
            ? "📁"
            : "📄";


    item.innerHTML = `

        <span class="tree-arrow">
            ${arrow}
        </span>

        <span class="tree-icon">
            ${icon}
        </span>

        <span class="tree-name">
            ${escapeHtml(node.name)}
        </span>

    `;


    item.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            selectedItem =
                node;


            selectedItemPath =
                path;


            if (isFolder) {

                selectedFolder =
                    path;


                toggleFolder(path);

            }


            updateSelectedInfo();

            updateCurrentPath();

            renderTree(treeData);

            renderSidebar(treeData);

        }
    );


    item.addEventListener(
        "dblclick",
        (event) => {

            event.stopPropagation();


            if (isFolder) {

                selectedFolder =
                    path;

            } else {

                openFile(
                    node,
                    path
                );

            }

        }
    );


    container.appendChild(item);


    
    if (
        isFolder &&
        isExpanded &&
        node.children
    ) {

        for (
            const child
            of node.children
        ) {

            const childPath =
                `${path}/${child.name}`;


            renderNode(
                child,
                container,
                level + 1,
                childPath
            );

        }

    }

}

function toggleFolder(path) {

    if (
        expandedFolders.has(path)
    ) {

        expandedFolders.delete(path);

    } else {

        expandedFolders.add(path);

    }

}


function fsFindNode(
    path,
    node = treeData,
    currentPath = "/root"
) {

    if (!node) {
        return null;
    }


    if (
        currentPath === path
    ) {

        return node;

    }


    if (
        node.type !== "folder" ||
        !node.children
    ) {

        return null;

    }


    for (
        const child
        of node.children
    ) {

        const childPath =
            `${currentPath}/${child.name}`;


        const result =
            fsFindNode(
                path,
                child,
                childPath
            );


        if (result) {
            return result;
        }

    }


    return null;

}


function getNodePath(
    target,
    node = treeData,
    path = "/root"
) {

    if (!node) {
        return null;
    }


    if (node === target) {
        return path;
    }


    if (
        node.type !== "folder" ||
        !node.children
    ) {

        return null;

    }


    for (
        const child
        of node.children
    ) {

        const childPath =
            `${path}/${child.name}`;


        const result =
            getNodePath(
                target,
                child,
                childPath
            );


        if (result) {
            return result;
        }

    }


    return null;

}

function renderSidebar(root) {

    const sidebar =
        document.getElementById(
            "sidebar-tree"
        );


    sidebar.innerHTML = "";


    renderSidebarNode(
        root,
        sidebar,
        0,
        "/root"
    );

}


function renderSidebarNode(
    node,
    container,
    level,
    path
) {

    if (
        node.type !== "folder"
    ) {

        return;

    }


    const button =
        document.createElement(
            "button"
        );


    button.className =
        "sidebar-item";


    if (
        selectedFolder === path
    ) {

        button.classList.add(
            "active"
        );

    }


    button.style.paddingLeft =
        `${8 + level * 18}px`;


    const isExpanded =
        expandedFolders.has(path);


    const arrow =
        isExpanded
            ? "▼"
            : "▶";


    button.innerHTML = `

        <span class="sidebar-arrow">
            ${arrow}
        </span>

        <span class="sidebar-icon">
            📁
        </span>

        <span>
            ${escapeHtml(node.name)}
        </span>

    `;


    button.addEventListener(
        "click",
        () => {

            selectedFolder =
                path;


            selectedItem =
                node;


            selectedItemPath =
                path;


            toggleFolder(path);


            closeFileEditor();


            updateSelectedInfo();

            updateCurrentPath();


            renderSidebar(
                treeData
            );


            renderTree(
                treeData
            );

        }
    );


    container.appendChild(
        button
    );

    if (
        isExpanded &&
        node.children
    ) {

        for (
            const child
            of node.children
        ) {

            if (
                child.type !== "folder"
            ) {

                continue;

            }


            const childPath =
                `${path}/${child.name}`;


            renderSidebarNode(
                child,
                container,
                level + 1,
                childPath
            );

        }

    }

}

function updateCurrentPath() {

    const element =
        document.getElementById(
            "current-path"
        );


    if (element) {

        element.textContent =
            selectedFolder;

    }

}


function updateSelectedInfo() {

    const info =
        document.getElementById(
            "selected-info"
        );


    if (!selectedItem) {

        info.innerHTML =
            "Nothing selected";

        return;

    }


    const path =
        getNodePath(
            selectedItem
        );


    let html = `

        <div>
            <strong>Name:</strong>
            ${escapeHtml(
                selectedItem.name
            )}
        </div>

        <div>
            <strong>Type:</strong>
            ${escapeHtml(
                selectedItem.type
            )}
        </div>

        <div>
            <strong>Path:</strong>
            ${escapeHtml(
                path || ""
            )}
        </div>

    `;


    if (
        selectedItem.type === "file"
    ) {

        html += `

            <div>
                <strong>Size:</strong>
                ${formatSize(
                    selectedItem.size || 0
                )}
            </div>

        `;

    }


    info.innerHTML =
        html;

}


function formatSize(bytes) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return "0 B";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    let index = 0;

    let size = bytes;


    while (
        size >= 1024 &&
        index <
            units.length - 1
    ) {

        size /= 1024;

        index++;

    }


    return `${size.toFixed(2)} ${units[index]}`;

}

async function createFolder() {

    const name =
        prompt(
            "Enter folder name:"
        );


    if (!name) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/folder`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            parent:
                                selectedFolder,

                            name:
                                name
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to create folder"
            );

            return;

        }


        await loadTree();

        await loadStorage();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to backend."
        );

    }
}


async function createFile() {

    const name =
        prompt(
            "Enter file name:"
        );


    if (!name) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/file`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            parent:
                                selectedFolder,

                            name:
                                name,

                            content:
                                ""
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to create file"
            );

            return;

        }


        await loadTree();

        await loadStorage();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to backend."
        );

    }

}

async function deleteItem() {

    if (
        !selectedItem ||
        !selectedItemPath
    ) {

        alert(
            "Select a file or folder first."
        );

        return;

    }


    if (
        selectedItemPath === "/root"
    ) {

        alert(
            "The root folder cannot be deleted."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete "${selectedItem.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/delete`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            path:
                                selectedItemPath
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to delete item"
            );

            return;

        }


        removeExpandedPath(
            selectedItemPath
        );


        selectedItem = null;

        selectedItemPath = null;


        closeFileEditor();
        selectedItem = null;
        selectedItemPath = null;

        if (currentEditorPath === path) {
            currentEditorPath = null;
            document.getElementById("file-content").value = "";
            document.getElementById("file-content").disabled = true;
            document.getElementById("editor-file-name").textContent = "No file selected";
            document.getElementById("save-file-btn").disabled = true;
            document.getElementById("close-file-btn").disabled = true;
}

        await loadTree();
        selectedItemPath = null;
        selectedItem = null;

        await loadStorage();

        updateSelectedInfo();


    } 
    catch (error) {

    console.error(error);

    alert( error.message || "Unable to connect to backend.");

    }

}

function removeExpandedPath(path) {

    for (
        const expandedPath
        of expandedFolders
    ) {

        if (
            expandedPath === path ||
            expandedPath.startsWith(
                `${path}/`
            )
        ) {

            expandedFolders.delete(
                expandedPath
            );

        }

    }

}


async function renameItem() {

    if (
        !selectedItem ||
        !selectedItemPath
    ) {

        alert(
            "Select a file or folder first."
        );

        return;

    }


    if (
        selectedItemPath === "/root"
    ) {

        alert(
            "The root folder cannot be renamed."
        );

        return;

    }


    const newName =
        prompt(
            "Enter new name:",
            selectedItem.name
        );


    if (!newName) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/rename`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            path:
                                selectedItemPath,

                            new_name:
                                newName

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to rename item"
            );

            return;

        }


        selectedItem = null;

        selectedItemPath = null;


        await loadTree();


        updateSelectedInfo();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to backend."
        );

    }

}



async function searchItem() {

    const input =
        document.getElementById(
            "search-input"
        );


    const name =
        input.value.trim();


    if (!name) {

        alert(
            "Enter a name to search."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/search?name=${encodeURIComponent(name)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Item not found"
            );

            return;

        }


        showSearchResults(
            data.results
        );


    } catch (error) {

        console.error(error);

        alert(
            "Search failed."
        );

    }

}


function showSearchResults(
    results
) {

    const container =
        document.getElementById(
            "tree-container"
        );


    container.innerHTML = "";


    const heading =
        document.createElement(
            "div"
        );


    heading.style.marginBottom =
        "15px";


    heading.innerHTML =
        `<strong>Search Results</strong>`;


    container.appendChild(
        heading
    );


    for (
        const result
        of results
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "search-result";


        item.innerHTML = `

            <div
                class="search-result-name"
            >
                ${
                    result.type === "folder"
                        ? "📁"
                        : "📄"
                }

                ${escapeHtml(
                    result.name
                )}
            </div>

            <div
                class="search-result-path"
            >
                ${escapeHtml(
                    result.path
                )}
            </div>

        `;


        item.addEventListener(
            "click",
            () => {

                const node =
                    fsFindNode(
                        result.path
                    );


                if (!node) {
                    return;
                }


                selectedItem =
                    node;


                selectedItemPath =
                    result.path;


                if (
                    node.type === "folder"
                ) {

                    selectedFolder =
                        result.path;

                }

                expandParentFolders(
                    result.path
                );


                updateSelectedInfo();

                updateCurrentPath();

                renderTree(
                    treeData
                );

                renderSidebar(
                    treeData
                );

            }
        );


        container.appendChild(
            item
        );

    }

}


function expandParentFolders(
    path
) {

    const parts =
        path
            .split("/")
            .filter(Boolean);


    let currentPath =
        "";


    for (
        let i = 0;
        i < parts.length - 1;
        i++
    ) {

        currentPath +=
            `/${parts[i]}`;


        expandedFolders.add(
            currentPath
        );

    }

}


async function openFile(
    node,
    path
) {


    if (node.stored_name) {

        window.location.href =`${API_URL}/download?path=${encodeURIComponent(path)}`;

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/file?path=${encodeURIComponent(path)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to open file"
            );

            return;

        }


        currentEditorPath =
            path;


        document.getElementById(
            "editor-file-name"
        ).textContent =
            data.name;


        const editor =
            document.getElementById(
                "file-content"
            );


        editor.value =
            data.content || "";


        editor.disabled =
            false;


        document.getElementById(
            "save-file-btn"
        ).disabled =
            false;


        document.getElementById(
            "close-file-btn"
        ).disabled =
            false;


    } catch (error) {

        console.error(error);

        alert(
            "Unable to open file."
        );

    }

}

async function saveFile() {

    if (!currentEditorPath) {

        alert(
            "No file is open."
        );

        return;

    }


    const editor =
        document.getElementById(
            "file-content"
        );


    try {

        const response =
            await fetch(
                `${API_URL}/file`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            path:
                                currentEditorPath,

                            content:
                                editor.value

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to save file"
            );

            return;

        }


        alert(
            "File saved successfully."
        );


        await loadTree();

        await loadStorage();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to save file."
        );

    }

}


function closeFileEditor() {

    currentEditorPath = null;


    const editor =
        document.getElementById(
            "file-content"
        );


    editor.value = "";

    editor.disabled = true;


    document.getElementById(
        "editor-file-name"
    ).textContent =
        "No file selected";


    document.getElementById(
        "save-file-btn"
    ).disabled =
        true;


    document.getElementById(
        "close-file-btn"
    ).disabled =
        true;

}


function uploadFile() {

    document
        .getElementById(
            "file-upload-input"
        )
        .click();

}


async function handleFileUpload(
    event
) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "parent",
        selectedFolder
    );


    try {

        const response =
            await fetch(
                `${API_URL}/upload`,
                {
                    method: "POST",

                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Upload failed"
            );

            return;

        }


        await loadTree();

        await loadStorage();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to upload file."
        );

    }


    event.target.value = "";

}

async function loadStorage() {

    try {

        const response =
            await fetch(
                `${API_URL}/storage`
            );


        const data =
            await response.json();


        const totalBytes =
            data.total_size || 0;


        const capacity =
            5 *
            1024 *
            1024 *
            1024;


        let percentage =
            (
                totalBytes /
                capacity
            ) * 100;


        percentage =
            Math.min(
                percentage,
                100
            );


        document.getElementById(
            "storage-progress"
        ).style.width =
            `${percentage}%`;


        document.getElementById(
            "storage-info"
        ).textContent =
            `${formatSize(totalBytes)} used of 5 GB`;


    } catch (error) {

        console.error(error);


        document.getElementById(
            "storage-info"
        ).textContent =
            "Storage unavailable";

    }

}

function setupTheme() {

    const darkToggle =
        document.getElementById(
            "dark-toggle"
        );


    const themeToggle =
        document.getElementById(
            "theme-toggle"
        );


    const savedTheme =
        localStorage.getItem(
            "theme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }


    updateThemeIcons();


    darkToggle.addEventListener(
        "click",
        toggleTheme
    );


    themeToggle.addEventListener(
        "click",
        toggleTheme
    );

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "theme",
        isDark
            ? "dark"
            : "light"
    );


    updateThemeIcons();

}

function updateThemeIcons() {

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    const darkToggle =
        document.getElementById(
            "dark-toggle"
        );


    if (darkToggle) {

        darkToggle.textContent =
            isDark
                ? "☀"
                : "☾";

    }

}



function setupEventListeners() {

    document
        .getElementById(
            "new-folder-btn"
        )
        .addEventListener(
            "click",
            createFolder
        );


    document
        .getElementById(
            "new-file-btn"
        )
        .addEventListener(
            "click",
            createFile
        );


    document
        .getElementById(
            "upload-file-btn"
        )
        .addEventListener(
            "click",
            uploadFile
        );


    document
        .getElementById(
            "file-upload-input"
        )
        .addEventListener(
            "change",
            handleFileUpload
        );


    document
        .getElementById(
            "delete-btn"
        )
        .addEventListener(
            "click",
            deleteItem
        );


    document
        .getElementById(
            "rename-btn"
        )
        .addEventListener(
            "click",
            renameItem
        );


    document
        .getElementById(
            "search-btn"
        )
        .addEventListener(
            "click",
            searchItem
        );


    document
        .getElementById(
            "search-input"
        )
        .addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    searchItem();

                }

            }
        );


    document
        .getElementById(
            "save-file-btn"
        )
        .addEventListener(
            "click",
            saveFile
        );


    document
        .getElementById(
            "close-file-btn"
        )
        .addEventListener(
            "click",
            closeFileEditor
        );

}

function escapeHtml(value) {

    return String(value)

        .replaceAll( "&", "&amp;")

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll('"',"&quot;")

        .replaceAll(
            "'",
            "&#039;"
        );

}
initialize();
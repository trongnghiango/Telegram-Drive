import React, { useState, useEffect, useMemo, useRef } from 'react';
import BreadcrumbsNav from './BreadcrumbsNav';
import FileTable from './FileTable';
import FileActionsModal from './FileActionsModal';
import { toast } from 'sonner';
import { useSession } from '../SessionContext';

function formatModifiedDate(dateStr) {
    const date = new Date(dateStr);
    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    };
    return date.toLocaleString('it-IT', options);
}

function formatSize(sizeInMB) {
    if (sizeInMB >= 1024) {
        return (sizeInMB / 1024).toFixed(1) + 'GB';
    } else if (sizeInMB >= 1) {
        return sizeInMB.toFixed(1) + 'MB';
    } else {
        return (sizeInMB * 1024).toFixed(1) + 'KB';
    }
}
function buildFileSystem(data, rootFolderName, isTrash = false) {
    const rootFolder = {
        type: 'folder',
        name: rootFolderName,
        modified: '',
        size: '',
        owner: [],
        locate_media: '',
        contents: {},
    };

    data.forEach((item) => {
        if (isTrash) {
            rootFolder.contents[item.media_name] = {
                type: 'file',
                name: item.media_name,
                modified: formatModifiedDate(item.date),
                size: formatSize(item.media_size),
                owner: [],
                id_message: item.id_message,
                cluster_id: item.cluster_id,
                media_type: item.media_type,
                message_text: item.message_text,
            };
        } else {
            let path = item.locate_media.replace(/^\.\//, '');
            let name = item.media_name;

            if (item.is_folder) {
                if (name === 'None') {
                    const pathParts = path.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                        name = pathParts.pop();
                        path = pathParts.join('/');
                    } else {
                        name = rootFolderName;
                        path = '';
                    }
                }
            } else {
                if (name === 'None') {
                    return;
                }
            }

            const fullPath = path ? `${path}/${name}` : name;
            const pathParts = fullPath.split('/').filter(Boolean);

            let currentFolder = rootFolder;

            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i];
                const isLastPart = i === pathParts.length - 1;

                if (isLastPart && !item.is_folder) {
                    currentFolder.contents[part] = {
                        type: 'file',
                        name: part,
                        modified: formatModifiedDate(item.date),
                        size: formatSize(item.media_size),
                        owner: [],
                        locate_media: item.locate_media,
                        id_message: item.id_message,
                        cluster_id: item.cluster_id,
                        media_type: item.media_type,
                        message_text: item.message_text,
                    };
                } else {
                    if (!currentFolder.contents[part]) {
                        currentFolder.contents[part] = {
                            type: 'folder',
                            name: part,
                            modified: isLastPart ? formatModifiedDate(item.date) : '',
                            size: '',
                            owner: [],
                            locate_media: item.locate_media,
                            contents: {},
                            id_message: item.id_message,
                            cluster_id: item.cluster_id,
                            media_type: item.media_type,
                            message_text: item.message_text,
                        };
                    }

                    if (currentFolder.contents[part].type === 'folder') {
                        currentFolder = currentFolder.contents[part];
                    } else {
                        console.warn(`Expected a folder at ${part}, but found a file.`);
                        break;
                    }
                }
            }
        }
    });

    return rootFolder;
}



function getFolderFromPath(root, path) {
    let currentFolder = root;
    for (let i = 1; i < path.length; i++) {
        const folderName = path[i];
        if (
            currentFolder.contents[folderName] &&
            currentFolder.contents[folderName].type === 'folder'
        ) {
            currentFolder = currentFolder.contents[folderName];
        } else {
            return null;
        }
    }
    return currentFolder;
}

export default function FileManager({ onFileClick, selectedSection, baseUrl, setProgress, setIsDownloadActive, isDownloadActive, refreshFiles, setRefreshFiles }) {
    const [data, setData] = useState([]);
    const [fileSystem, setFileSystem] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [open, setOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [newName, setNewName] = useState('');
    const hasFetchedInitially = useRef(false);


    const { token, clusterIdPrivate, clusterIdPublic } = useSession();
    const rootFolderName =
        selectedSection === 'myFiles'
            ? 'MyFiles'
            : selectedSection === 'sharedFiles'
                ? 'SharedFiles'
                : 'Trash';

    useEffect(() => {
        const fetchData = async () => {
            let url;

            setData([]);

            if (selectedSection === 'sharedFiles') {
                url = `${baseUrl["baseUrl"]}/get-all-files-public`;
            } else if (selectedSection === 'myFiles') {
                url = `${baseUrl["baseUrl"]}/get-all-files`;
            } else if (selectedSection === 'trash') {
                url = `${baseUrl["baseUrl"]}/get-trash-files`;
            }

            let options = {
                method: 'POST',
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            };

            if (selectedSection === 'trash') {
                options.method = 'GET';
            } else {
                options.body = JSON.stringify({
                    cluster_id: selectedSection === 'sharedFiles' ? clusterIdPublic : clusterIdPrivate
                });
            }

            try {
                const response = await fetch(url, options);

                if (response.ok && response.status !== 204) {
                    const result = await response.json();

                    if (result && result.status === 'success') {
                        setData(result.data);
                    } else {
                        throw new Error(result.message || 'Failed to fetch files.');
                    }
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch files.');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error(error.message || 'An error occurred while fetching files.');
            }
        };

        if (!hasFetchedInitially.current && token) {
            fetchData();
            hasFetchedInitially.current = true;
        } else if (token) {
            fetchData();
        }
    }, [selectedSection, refreshFiles]);




    useEffect(() => {
        setCurrentPath([rootFolderName]);
        const newFileSystem = buildFileSystem(data, rootFolderName, selectedSection === 'trash');
        setFileSystem(newFileSystem);
    }, [data, rootFolderName, selectedSection]);

    const currentFolder = useMemo(() => {
        if (!fileSystem) return null;
        return getFolderFromPath(fileSystem, currentPath);
    }, [fileSystem, currentPath]);

    const files = currentFolder ? Object.values(currentFolder.contents) : [];

    const sortedFiles = useMemo(() => {
        const folders = files
            .filter((item) => item.type === 'folder')
            .sort((a, b) => a.name.localeCompare(b.name));
        const filesOnly = files
            .filter((item) => item.type === 'file')
            .sort((a, b) => a.name.localeCompare(b.name));
        return [...folders, ...filesOnly];
    }, [files]);

    const handleOpenModal = (type, file) => {
        setModalType(type);
        setSelectedFile(file);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setModalType('');
        setSelectedFile(null);
        setNewName('');
    };

    const handleRename = () => {
        handleCloseModal();
    };

    const handleDelete = () => {
        handleCloseModal();
    };

    const handleFolderClick = (folderName) => {
        setCurrentPath([...currentPath, folderName]);
    };

    const handleBreadcrumbClick = (index) => {
        setCurrentPath(currentPath.slice(0, index + 1));
    };

    return (
        <div>
            <BreadcrumbsNav
                currentPath={currentPath}
                onBreadcrumbClick={handleBreadcrumbClick}
            />
            <FileTable
                baseUrl={baseUrl}
                files={sortedFiles}
                onFileClick={onFileClick}
                onFolderClick={handleFolderClick}
                onOpenModal={handleOpenModal}
                setRefreshFiles={setRefreshFiles}
                setProgress={setProgress}
                setIsDownloadActive={setIsDownloadActive}
                isDownloadActive={isDownloadActive}
            />
            <FileActionsModal
                open={open}
                modalType={modalType}
                onClose={handleCloseModal}
                onRename={handleRename}
                onDelete={handleDelete}
                selectedFile={selectedFile}
                newName={newName}
                setNewName={setNewName}
            />
        </div>
    );
}

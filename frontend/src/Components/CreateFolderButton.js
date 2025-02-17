import React, { useState } from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import Box from '@mui/joy/Box';
import { styled } from '@mui/joy/styles';
import { Typography, Input, Select, Option, CircularProgress } from "@mui/joy";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { toast } from "sonner";
import { useSession } from './SessionContext';

const CreateFolderButton = ({ baseUrl, setRefreshFiles }) => {
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [selectedDrive, setSelectedDrive] = useState('');
    const [selectedSubfolder, setSelectedSubfolder] = useState('');
    const [availableDrives, setAvailableDrives] = useState([]);
    const [availableSubfolders, setAvailableSubfolders] = useState([]);
    const [loadingDrives, setLoadingDrives] = useState(false);
    const [loadingSubfolders, setLoadingSubfolders] = useState(false);
    const { token, clusterIdPrivate, clusterIdPublic } = useSession();

    const handleOpen = () => {
        setOpen(true);
        fetchClustersInfo();
    };

    const handleClose = () => {
        setOpen(false);
        setFolderName('');
        setSelectedDrive('');
        setSelectedSubfolder('');
        setAvailableSubfolders([]);
    };

    const handleFolderNameChange = (event) => {
        const value = event.target.value;
        const regex = /^[a-zA-Z0-9 _-]*$/;
        if (regex.test(value)) {
            setFolderName(value);
        } else {
            toast.error('Sono consentiti solo caratteri alfanumerici, spazi, trattini e underscore.');
        }
    };

    const handleDriveChange = (event, newValue) => {
        if (newValue) {
            setSelectedDrive(newValue);
            fetchFolders(newValue);
        } else {
            setSelectedDrive('');
            setAvailableSubfolders([]);
            setSelectedSubfolder('');
        }
    };

    const handleSubfolderChange = (event, newValue) => {
        if (newValue) {
            setSelectedSubfolder(newValue);
        } else {
            setSelectedSubfolder('');
        }
    };


    const fetchClustersInfo = () => {
        setLoadingDrives(true);
        try {

            const formattedClusters = [];

            if (clusterIdPrivate) {
                formattedClusters.push({ name: 'My Files', value: clusterIdPrivate });
            }

            if (clusterIdPublic) {
                formattedClusters.push({name: 'Shared Files', value: clusterIdPublic});
            }

            if (formattedClusters.length > 0) {
                setAvailableDrives(formattedClusters);
            } else {
                throw new Error('No cluster information available');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to set cluster information');
        } finally {
            setLoadingDrives(false);
        }
    };


    const fetchFolders = async (driveId) => {
        setLoadingSubfolders(true);
        try {
            const response = await fetch(`${baseUrl["baseUrl"]}/get-folders`, {
                method: 'POST',
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    c: parseInt(driveId),
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                const locations = [
                    { name: './', path: './' },
                    ...data.data.map(folder => ({
                        name: folder.locate_media,
                        path: folder.locate_media,
                    }))
                ];

                setAvailableSubfolders(locations);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingSubfolders(false);
        }
    };

    const createFolder = async () => {
        try {
            const folderPath = selectedSubfolder === './' ? `${selectedSubfolder}${folderName}` : `${selectedSubfolder}/${folderName}`;

            const response = await fetch(`${baseUrl["baseUrl"]}/create-folder`, {
                method: 'POST',
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    c: parseInt(selectedDrive),
                    folder_path: folderPath
                }),
            });

            const data = await response.json();

            if (data.status !== 'success') {
                throw new Error(data.message);
            }

            toast.success(data.message);
            handleClose();
            setRefreshFiles((prev) => !prev);
        } catch (error) {
            toast.error(error.message);
        }
    };



    return (
        <>
            <Button
                onClick={handleOpen}
                variant="solid"
                color="primary"
                sx={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#0056b3',
                    },
                }}
                startDecorator={
                    <CreateNewFolderIcon />
                }
            >
                Create Folder
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        maxWidth: 400,
                        mx: 'auto',
                        p: 3,
                        mt: '10%',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <Typography level="h5" sx={{ mb: 2 }}>
                        Create New Folder
                    </Typography>

                    <Input
                        placeholder="Folder Name"
                        value={folderName}
                        onChange={handleFolderNameChange}
                        sx={{ mb: 2 }}
                        required
                    />

                    <Select
                        placeholder={loadingDrives ? 'Loading drives...' : 'Select Drive'}
                        onChange={handleDriveChange}
                        sx={{ mb: 2 }}
                        value={selectedDrive}
                        disabled={loadingDrives || availableDrives.length === 0}
                        startDecorator={loadingDrives && <CircularProgress size="sm" />}
                    >
                        {availableDrives.map((drive) => (
                            <Option key={drive.value} value={drive.value}>
                                {drive.name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        placeholder={loadingSubfolders ? 'Loading subfolders...' : 'Select Subfolder'}
                        onChange={handleSubfolderChange}
                        sx={{ mb: 2 }}
                        value={selectedSubfolder}
                        disabled={!selectedDrive || loadingSubfolders || availableSubfolders.length === 0}
                        startDecorator={loadingSubfolders && <CircularProgress size="sm" />}
                    >
                        {availableSubfolders.map((subfolder, index) => (
                            <Option key={index} value={subfolder.path}>
                                {subfolder.name}
                            </Option>
                        ))}
                    </Select>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleClose} variant="outlined" color="danger">
                            Cancel
                        </Button>
                        <Button
                            onClick={createFolder}
                            variant="solid"
                            color="success"
                            disabled={!folderName || !selectedDrive || !selectedSubfolder}
                        >
                            Create
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default CreateFolderButton;

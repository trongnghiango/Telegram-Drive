import React, { useState } from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import Box from '@mui/joy/Box';
import { styled } from '@mui/joy/styles';
import { Typography, Select, Option, CircularProgress, LinearProgress } from "@mui/joy";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from "sonner";
import { useSession } from './SessionContext';

const VisuallyHiddenInput = styled('input')`
  display: none;
`;

const UploadButton = ({ baseUrl, setRefreshFiles }) => {
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDrive, setSelectedDrive] = useState('');
    const [selectedSubfolder, setSelectedSubfolder] = useState('');
    const [availableDrives, setAvailableDrives] = useState([]);
    const [availableSubfolders, setAvailableSubfolders] = useState([]);
    const [loadingDrives, setLoadingDrives] = useState(false);
    const [loadingSubfolders, setLoadingSubfolders] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { token, clusterIdPrivate, clusterIdPublic } = useSession();

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        if (!isUploading) {
            setOpen(false);
            setSelectedFile(null);
            setSelectedDrive('');
            setSelectedSubfolder('');
            setAvailableDrives([]);
            setAvailableSubfolders([]);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            fetchDrives();
        }
    };

    const handleDriveChange = (event, newValue) => {
        if (newValue) {
            setSelectedDrive(newValue);
            fetchSubfolders(newValue);
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

    const fetchDrives = () => {
        setLoadingDrives(true);
        try {
            const formattedDrives = [];

            if (clusterIdPrivate) {
                formattedDrives.push({ name: 'My Files', value: clusterIdPrivate });
            }

            if (clusterIdPublic) {
                formattedDrives.push({ name: 'Shared Files', value: clusterIdPublic });
            }

            if (formattedDrives.length > 0) {
                setAvailableDrives(formattedDrives);
            } else {
                throw new Error('No drives available');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to set drives');
        } finally {
            setLoadingDrives(false);
        }
    };

    const fetchSubfolders = async (driveId) => {
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

    const uploadFile = async () => {
        if (selectedFile && selectedDrive && selectedSubfolder) {

            const fileSize = selectedFile.size;

            const destination = `${selectedSubfolder}`;

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('destination', destination);
            formData.append('c', selectedDrive);
            formData.append('file_size', fileSize.toString());

            setIsUploading(true);

            try {
                const response = await fetch(`${baseUrl["baseUrl"]}/upload`, {
                    method: 'POST',
                    headers: {
                        Authorization: `${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();

                if (data.status === 'success') {
                    toast.success('File uploaded successfully!');
                    handleClose();
                    if (setRefreshFiles) {
                        setRefreshFiles(prev => !prev);
                    }
                } else {
                    throw new Error(data.message || 'Upload failed');
                }
            } catch (error) {
                toast.error(error.message || 'Upload failed');
            } finally {
                setIsUploading(false);
            }
        } else {
            toast.error('Please select a file, a drive, and a destination.');
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
                startDecorator={<CloudUploadIcon />}
                disabled={isUploading}
            >
                Upload File
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        maxWidth: 500,
                        mx: 'auto',
                        p: 3,
                        mt: '10%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <Typography level="h5" sx={{ mb: 2 }}>
                        Upload a File
                    </Typography>

                    {isUploading && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress color="primary" />
                        </Box>
                    )}

                    {!selectedFile && (
                        <Button
                            component="label"
                            variant="outlined"
                            color="primary"
                            sx={{ mb: 2 }}
                            disabled={isUploading}
                        >
                            Choose File to Upload
                            <VisuallyHiddenInput type="file" onChange={handleFileSelect} />
                        </Button>
                    )}

                    {selectedFile && (
                        <Typography level="body1" sx={{ mb: 2 }}>
                            Selected file: {selectedFile.name}
                        </Typography>
                    )}

                    {selectedFile && (
                        <>
                            <Select
                                placeholder={loadingDrives ? 'Loading drives...' : 'Select Drive'}
                                onChange={(event, value) => handleDriveChange(event, value)}
                                sx={{ mb: 2 }}
                                value={selectedDrive}
                                disabled={loadingDrives || availableDrives.length === 0 || isUploading}
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
                                onChange={(event, value) => handleSubfolderChange(event, value)}
                                sx={{ mb: 2 }}
                                value={selectedSubfolder}
                                disabled={!selectedDrive || loadingSubfolders || availableSubfolders.length === 0 || isUploading}
                                startDecorator={loadingSubfolders && <CircularProgress size="sm" />}
                            >
                                {availableSubfolders.map((subfolder, index) => (
                                    <Option key={index} value={subfolder.path}>
                                        {subfolder.name}
                                    </Option>
                                ))}
                            </Select>
                        </>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            color="danger"
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={uploadFile}
                            variant="solid"
                            color="success"
                            disabled={!selectedFile || !selectedDrive || !selectedSubfolder || isUploading}
                            startDecorator={isUploading && <CircularProgress size="sm" />}
                        >
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );

};

export default UploadButton;

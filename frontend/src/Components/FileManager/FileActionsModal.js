import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Button from '@mui/joy/Button';
import {Input, Select, Option, CircularProgress } from "@mui/joy";


export default function FileActionsModal({
                                             open,
                                             modalType,
                                             onClose,
                                             onRename,
                                             onDelete,
                                             onMove,
                                             onDownload,
                                             selectedFile,
                                             newName,
                                             setNewName,
                                             newLocation,
                                             setNewLocation,
                                             availableLocations,
                                             isDownloadActive,
                                             progress,
                                             loadingLocations
                                         }) {
    const fileName = selectedFile?.name || '';
    const lastDotIndex = fileName.lastIndexOf('.');
    const fileExtension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1) : '';
    const baseName = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;

    const isValidName = (name) => /^[a-zA-Z0-9\s._-]+$/.test(name);

    const handleRename = () => {
        if (selectedFile?.type === 'file') {
            const sanitizedNewName = newName.trim();
            const updatedFileName = `${sanitizedNewName}.${fileExtension}`;
            onRename(updatedFileName);
        } else {
            onRename(newName.trim());
        }
    };


    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog>
                {modalType === 'rename' && (
                    <>
                        <DialogTitle>{selectedFile?.type === 'folder' ? 'Rename Folder' : 'Rename File'}</DialogTitle>
                        <DialogContent>
                            <form onSubmit={(event) => {
                                event.preventDefault();
                                handleRename();
                            }}>
                                <Stack spacing={2}>
                                    <FormControl>
                                        <FormLabel>Nuovo Nome</FormLabel>
                                        <Stack direction="row" spacing={1}>
                                            <Input
                                                autoFocus
                                                required
                                                value={newName.split(".")[0]}
                                                onChange={(e) => setNewName(e.target.value)}
                                                placeholder={baseName || "Insert new name"}
                                                error={!isValidName(newName)}
                                                helperText={!isValidName(newName) ? "Only alphanumeric characters, spaces, underscores, periods and dashes are allowed\n" : ""}
                                            />
                                            {selectedFile?.type === 'file' && (
                                                <Input
                                                    value={fileExtension ? `.${fileExtension}` : ''}
                                                    disabled
                                                    sx={{ width: 'auto' }}
                                                />
                                            )}
                                        </Stack>
                                    </FormControl>
                                    <Button type="submit" disabled={!isValidName(newName)}>Rename</Button>
                                </Stack>
                            </form>
                        </DialogContent>
                    </>
                )}

                {modalType === 'delete' && (
                    <>
                        <DialogTitle>Elimina {selectedFile?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
                        <DialogContent>Sei sicuro di voler eliminare questa {selectedFile?.type === 'folder' ? 'folder' : 'file'}?</DialogContent>
                        <Stack
                            direction="row"
                            spacing={2}
                            justifyContent="flex-end"
                            sx={{ p: 2 }}
                        >
                            <Button variant="plain" onClick={onClose}>Cancel</Button>
                            <Button variant="solid" color="danger" onClick={onDelete}>Delete</Button>
                        </Stack>
                    </>
                )}

                {modalType === 'move' && (
                    <>
                        <DialogTitle>Move File</DialogTitle>
                        <DialogContent>
                            <form onSubmit={(event) => { event.preventDefault(); onMove(); }}>
                                <Stack spacing={2}>
                                    <FormControl>
                                        <FormLabel>New Position</FormLabel>
                                        <Select
                                            autoFocus
                                            required
                                            value={newLocation}
                                            onChange={(e, newValue) => setNewLocation(newValue)}
                                            placeholder={loadingLocations ? 'Loading position...' : 'Select new position'}
                                            sx={{ mb: 2 }}
                                            disabled={loadingLocations || availableLocations.length === 0}
                                            startDecorator={loadingLocations && <CircularProgress size="sm" />}
                                        >
                                            {availableLocations
                                                .filter(location => location.name && location.path)
                                                .map((location) => (
                                                    <Option key={location.path} value={location.path}>
                                                        {location.name}
                                                    </Option>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <Button type="submit" disabled={loadingLocations}>
                                        Move
                                    </Button>
                                </Stack>
                            </form>
                        </DialogContent>
                    </>
                )}


                {modalType === 'download' && (
                    <>
                        <DialogTitle>Download File</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    onDownload();
                                }}>
                                    <Stack spacing={2}>
                                        <FormControl>
                                            <FormLabel>Nome del file</FormLabel>
                                            <Stack direction="row" spacing={1}>
                                                <Input
                                                    required
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    placeholder={baseName || "Insert new file name"}
                                                    error={!isValidName(newName)}
                                                    helperText={!isValidName(newName) ? "Only alphanumeric characters, spaces, underscores, periods and dashes are allowed" : ""}
                                                />
                                            </Stack>
                                        </FormControl>
                                        <Button type="submit" disabled={!isValidName(newName) || isDownloadActive}>
                                            {isDownloadActive ? `Download...: ${progress}%` : "Download"}
                                        </Button>
                                    </Stack>
                                </form>
                            </Stack>
                        </DialogContent>
                    </>
                )}


            </ModalDialog>
        </Modal>
    );
}
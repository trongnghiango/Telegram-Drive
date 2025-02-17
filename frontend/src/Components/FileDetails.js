import React, { useState } from 'react';
import {
    Box,
    Sheet,
    Typography,
    IconButton,
    Divider,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    AspectRatio,
} from '@mui/joy';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FileActionsModal from './FileManager/FileActionsModal';

export default function FileDetails({ file, onClose }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [newName, setNewName] = useState('');

    const handleOpenModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType('');
    };


    return (
        <>
            <Sheet
                sx={{
                    display: { xs: 'none', sm: 'initial' },
                    borderLeft: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography level="title-md" sx={{ flex: 1 }}>
                        {file.name}
                    </Typography>
                    <IconButton component="span" variant="plain" color="neutral" size="sm" onClick={onClose}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>
                <Divider />
                <Tabs>
                    <TabList>
                        <Tab sx={{ flexGrow: 1 }}>
                            <Typography level="title-sm">Details</Typography>
                        </Tab>

                    </TabList>
                    <TabPanel value={0} sx={{ p: 0 }}>
                        <AspectRatio ratio="21/9">
                            <img
                                alt={file.name}
                                src={file.imageUrl || 'https://via.placeholder.com/400'}
                                srcSet={file.imageUrl ? file.imageUrl + ' 2x' : 'https://via.placeholder.com/800 2x'}
                            />
                        </AspectRatio>

                        <Divider />
                        <Box
                            sx={{
                                gap: 2,
                                p: 2,
                                display: 'grid',
                                gridTemplateColumns: 'auto 1fr',
                                '& > *:nth-child(odd)': { color: 'text.secondary' },
                            }}
                        >
                            <Typography level="title-sm">Type</Typography>
                            <Typography level="body-sm" textColor="text.primary">
                                {file.type}
                            </Typography>
                            <Typography level="title-sm">Size</Typography>
                            <Typography level="body-sm" textColor="text.primary">
                                {file.size}
                            </Typography>


                            <Typography level="title-sm">Modified</Typography>
                            <Typography level="body-sm" textColor="text.primary">
                                {file.modified}
                            </Typography>
                            <Typography level="title-sm">Created</Typography>
                            <Typography level="body-sm" textColor="text.primary">
                                Unknown
                            </Typography>
                        </Box>
                        <Divider />

                    </TabPanel>
                </Tabs>
            </Sheet>

            <FileActionsModal
                open={isModalOpen}
                modalType={modalType}
                onClose={handleCloseModal}

                selectedFile={file}
                newName={newName}
                setNewName={setNewName}
            />
        </>
    );
}

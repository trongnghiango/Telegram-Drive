import React, { useState } from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';

import Layout from '../Components/Layout';
import Navigation from '../Components/Navigation';
import Header from '../Components/Header';
import TableFiles from '../Components/FileManager/FileManager';
import FileDetails from '../Components/FileDetails';

export default function Drive(baseUrl) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedSection, setSelectedSection] = useState('myFiles');
    const [progress, setProgress] = useState(0);
    const [isDownloadActive, setIsDownloadActive] = useState(false);
    const [refreshFiles, setRefreshFiles] = useState(false);

    const handleFileClick = (file) => {
        setSelectedFile(file);
    };

    const handleCloseDetails = () => {
        setSelectedFile(null);
    };

    const handleOpenDrawer = () => {
        setDrawerOpen(true);
    };

    const handleSectionChange = (section) => {
        setSelectedSection(section);
        setDrawerOpen(false);
    };

    return (
        <CssVarsProvider disableTransitionOnChange>
            <CssBaseline />
            {drawerOpen && (
                <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
                    <Navigation
                        baseUrl={baseUrl}
                        selectedSection={selectedSection}
                        onSectionChange={handleSectionChange}
                        isDownloadActive={isDownloadActive}
                        progress={progress}
                        setRefreshFiles={setRefreshFiles}
                    />
                </Layout.SideDrawer>
            )}

            <Layout.Root
                sx={[
                    {
                        gridTemplateColumns: selectedFile
                            ? {
                                xs: '1fr',
                                md: 'minmax(160px, 300px) minmax(600px, 1fr) minmax(300px, 420px)',
                            }
                            : { xs: '1fr', md: 'minmax(160px, 300px) 1fr' },
                    },
                    drawerOpen && {
                        height: '100vh',
                        overflow: 'hidden',
                    },
                ]}
            >
                <Layout.Header>
                    <Header baseUrl={baseUrl} onOpenDrawer={handleOpenDrawer} /> {/* Pass handleOpenDrawer */}
                </Layout.Header>
                <Layout.SideNav
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    <Navigation
                        baseUrl={baseUrl}
                        selectedSection={selectedSection}
                        onSectionChange={handleSectionChange}
                        isDownloadActive={isDownloadActive}
                        progress={progress}
                        setRefreshFiles={setRefreshFiles}
                        onOpenMenu={handleOpenDrawer}
                    />
                </Layout.SideNav>
                <Layout.Main>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 2,
                        }}
                    >
                        <Sheet
                            variant="outlined"
                            sx={{
                                borderRadius: 'sm',
                                gridColumn: '1/-1',
                                display: 'flex',
                            }}
                        >
                            <TableFiles
                                onFileClick={handleFileClick}
                                selectedSection={selectedSection}
                                baseUrl={baseUrl}
                                setProgress={setProgress}
                                setIsDownloadActive={setIsDownloadActive}
                                isDownloadActive={isDownloadActive}
                                progress={progress}
                                refreshFiles={refreshFiles}
                                setRefreshFiles={setRefreshFiles}
                            />
                        </Sheet>
                    </Box>
                </Layout.Main>
                {selectedFile && (
                    <FileDetails file={selectedFile} onClose={handleCloseDetails} />
                )}
            </Layout.Root>
        </CssVarsProvider>
    );
}

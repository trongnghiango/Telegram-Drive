import React from 'react';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';

import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

import UploadButton from './UploadButton.js';
import SyncButton from './SyncButton';
import CreateFolderButton from './CreateFolderButton';
import { LinearProgress, Typography, Box } from '@mui/joy';

export default function Navigation({
                                     baseUrl,
                                     selectedSection,
                                     onSectionChange = () => {},
                                     isDownloadActive,
                                     progress,
                                     setRefreshFiles,
                                   }) {
  return (
      <List
          size="sm"
          sx={{ '--ListItem-radius': '8px', '--List-gap': '4px', width: '250px' }}
      >
        <ListItem nested>
          <ListSubheader sx={{ letterSpacing: '2px', fontWeight: '800' }}>
            Browse
          </ListSubheader>
          <List
              aria-labelledby="nav-list-browse"
              sx={{ '& .JoyListItemButton-root': { p: '8px' } }}
          >
            <ListItem>
              <ListItemButton
                  selected={selectedSection === 'myFiles'}
                  onClick={() => onSectionChange('myFiles')}
              >
                <ListItemDecorator>
                  <FolderRoundedIcon fontSize="small" />
                </ListItemDecorator>
                <ListItemContent>My files</ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                  selected={selectedSection === 'sharedFiles'}
                  onClick={() => onSectionChange('sharedFiles')}
              >
                <ListItemDecorator>
                  <ShareRoundedIcon fontSize="small" />
                </ListItemDecorator>
                <ListItemContent>Shared files</ListItemContent>
              </ListItemButton>
            </ListItem>
            <ListItem>
              <ListItemButton
                  selected={selectedSection === 'trash'}
                  onClick={() => onSectionChange('trash')}
              >
                <ListItemDecorator>
                  <DeleteRoundedIcon fontSize="small" />
                </ListItemDecorator>
                <ListItemContent>Trash</ListItemContent>
              </ListItemButton>
            </ListItem>

          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader sx={{ letterSpacing: '2px', fontWeight: '800' }}>
            Actions
          </ListSubheader>
          <List
              aria-labelledby="nav-list-actions"
              sx={{ '& .JoyListItemButton-root': { p: '8px' } }}
          >
            <ListItem>
              <CreateFolderButton
                  baseUrl={baseUrl}
                  setRefreshFiles={setRefreshFiles}
              />
            </ListItem>
            <ListItem>
              <UploadButton baseUrl={baseUrl} setRefreshFiles={setRefreshFiles} />
            </ListItem>
            <ListItem>
              <SyncButton baseUrl={baseUrl} setRefreshFiles={setRefreshFiles} />
            </ListItem>
          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader sx={{ letterSpacing: '2px', fontWeight: '800' }}>
            Tasks queue
          </ListSubheader>
          <List
              aria-labelledby="nav-list-tasks"
              sx={{ '& .JoyListItemButton-root': { p: '8px' } }}
          >
            {isDownloadActive && (
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Download in progress: {progress}%
                    </Typography>
                    <LinearProgress variant="determinate" value={progress} />
                  </Box>
                </ListItem>
            )}
          </List>
        </ListItem>
      </List>
  );
}

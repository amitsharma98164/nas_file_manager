import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CreateNewFolder,
  NoteAdd,
  Upload,
  Add as AddIcon
} from '@mui/icons-material';

const CreateNewButton = ({ onCreateFolder, onCreateFile, onUploadFile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreateFolder = () => {
    handleClose();
    onCreateFolder();
  };

  const handleCreateFile = () => {
    handleClose();
    onCreateFile();
  };

  const handleUploadFile = () => {
    handleClose();
    onUploadFile();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleClick}
        fullWidth
        sx={{ 
          backgroundColor: '#3699ff',
          '&:hover': { backgroundColor: '#1a82ff' }
        }}
      >
        CREATE NEW
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleCreateFolder}>
          <ListItemIcon>
            <CreateNewFolder fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCreateFile}>
          <ListItemIcon>
            <NoteAdd fontSize="small" />
          </ListItemIcon>
          <ListItemText>Create File</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUploadFile}>
          <ListItemIcon>
            <Upload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload File</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CreateNewButton; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Grid,
  Paper,
  Drawer,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CreateNewFolder,
  NoteAdd,
  Search,
  Folder,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
  Menu as MenuIcon,
  Upload,
  Download,
  Delete,
  Edit,
  ArrowBack,
  Home,
  PhotoLibrary,
  VideoLibrary,
  AudioFile,
  Article,
  Archive,
  DeleteOutline,
  Settings,
  DriveFileMove,
  FileDownload,
  FolderZip,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Login from './components/Login';
import CreateNewButton from './components/CreateNewButton';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([
    { id: 1, name: 'Documents', type: 'folder', path: '/Documents', size: '6GB', fileCount: 12 },
    { id: 2, name: 'Images', type: 'folder', path: '/Images', size: '8GB', fileCount: 20 },
    { id: 3, name: 'Videos', type: 'folder', path: '/Videos', size: '2GB', fileCount: 5 },
    { id: 4, name: 'Music', type: 'folder', path: '/Music', size: '4GB', fileCount: 8 },
    { id: 5, name: 'Downloads', type: 'folder', path: '/Downloads', size: '6GB', fileCount: 12 },
    { id: 6, name: 'Archives', type: 'folder', path: '/Archives', size: '8GB', fileCount: 20 },
    { id: 7, name: 'Report.pdf', type: 'pdf', path: '/Documents/Report.pdf', size: '2.5 MB', fileCount: 0 },
    { id: 8, name: 'Presentation.pptx', type: 'doc', path: '/Documents/Presentation.pptx', size: '5.8 MB', fileCount: 0 },
    { id: 9, name: 'Photo1.jpg', type: 'image', path: '/Images/Photo1.jpg', size: '3.2 MB', fileCount: 0 },
    { id: 10, name: 'Photo2.png', type: 'image', path: '/Images/Photo2.png', size: '1.8 MB', fileCount: 0 },
    { id: 11, name: 'Song1.mp3', type: 'audio', path: '/Music/Song1.mp3', size: '4.5 MB', fileCount: 0 },
    { id: 12, name: 'Song2.mp3', type: 'audio', path: '/Music/Song2.mp3', size: '3.8 MB', fileCount: 0 },
  ]);

  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createFolderDialog, setCreateFolderDialog] = useState(false);
  const [createFileDialog, setCreateFileDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [renameDialog, setRenameDialog] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [uploadInput, setUploadInput] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [moveDialog, setMoveDialog] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('/');
  const [isDownloading, setIsDownloading] = useState(false);

  const sidebarItems = [
    { 
      icon: <Home />, 
      text: 'Home',
      onClick: () => setCurrentPath('/')
    },
    { 
      icon: <Folder />, 
      text: 'Documents',
      onClick: () => handleNavigate({ path: '/Documents' })
    },
    { 
      icon: <PhotoLibrary />, 
      text: 'Images',
      onClick: () => handleNavigate({ path: '/Images' })
    },
    { 
      icon: <VideoLibrary />, 
      text: 'Videos',
      onClick: () => handleNavigate({ path: '/Videos' })
    },
    { 
      icon: <AudioFile />, 
      text: 'Music',
      onClick: () => handleNavigate({ path: '/Music' })
    },
    { 
      icon: <Article />, 
      text: 'Downloads',
      onClick: () => handleNavigate({ path: '/Downloads' })
    },
    { 
      icon: <Archive />, 
      text: 'Archives',
      onClick: () => handleNavigate({ path: '/Archives' })
    },
    { 
      icon: <DeleteOutline />, 
      text: 'Trash',
      onClick: () => toast.info('Trash feature coming soon!')
    },
    { 
      icon: <Settings />, 
      text: 'Settings',
      onClick: () => toast.info('Settings feature coming soon!')
    },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'folder':
        return <Folder style={{ fontSize: 40, color: '#FFA000' }} />;
      case 'image':
        return <Image style={{ fontSize: 40, color: '#4CAF50' }} />;
      case 'pdf':
        return <PictureAsPdf style={{ fontSize: 40, color: '#F44336' }} />;
      case 'doc':
        return <Description style={{ fontSize: 40, color: '#2196F3' }} />;
      default:
        return <InsertDriveFile style={{ fontSize: 40, color: '#607D8B' }} />;
    }
  };

  const handleCreate = (type) => {
    if (!newItemName.trim()) {
      toast.error('Please enter a name!');
      return;
    }

    const newPath = currentPath === '/' ? `/${newItemName}` : `${currentPath}/${newItemName}`;
    
    const newItem = {
      id: Date.now(),
      name: newItemName,
      type: type,
      path: newPath,
      size: '0 KB',
      fileCount: 0,
    };

    // Check if file/folder with same name exists
    const exists = files.some(f => f.path === newPath);
    if (exists) {
      toast.error(`A ${type} with this name already exists!`);
      return;
    }

    setFiles([...files, newItem]);
    setNewItemName('');
    type === 'folder' ? setCreateFolderDialog(false) : setCreateFileDialog(false);
    toast.success(`${type === 'folder' ? 'Folder' : 'File'} created successfully!`);
  };

  const handleDelete = (file) => {
    setFiles(files.filter(f => !f.path.startsWith(file.path)));
    setSelectedFile(null);
    toast.success('Deleted successfully!');
  };

  const handleRename = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter a name!');
      return;
    }

    if (selectedFile) {
      const newPath = currentPath === '/' ? `/${newItemName}` : `${currentPath}/${newItemName}`;
      
      // Check if file/folder with same name exists
      const exists = files.some(f => f.path === newPath && f.id !== selectedFile.id);
      if (exists) {
        toast.error('An item with this name already exists!');
        return;
      }

      setFiles(files.map(f => 
        f.id === selectedFile.id ? { ...f, name: newItemName, path: newPath } : f
      ));
      setRenameDialog(false);
      setNewItemName('');
      toast.success('Renamed successfully!');
    }
  };

  const handleNavigate = (folder) => {
    setCurrentPath(folder.path);
    setSelectedFile(null);
  };

  const handleFileClick = (file, event) => {
    if (event.type === 'contextmenu') {
      event.preventDefault();
      setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
      setSelectedFile(file);
    } else {
      setSelectedFile(file);
      if (file.type === 'folder') {
        handleNavigate(file);
      }
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      
      // Check if file with same name exists
      const exists = files.some(f => f.path === newPath);
      if (exists) {
        toast.error('A file with this name already exists!');
        return;
      }

      // Create a FileReader to read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          id: Date.now(),
          name: file.name,
          type: file.type.split('/')[0],
          path: newPath,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          fileCount: 0,
          content: e.target.result, // Store the actual file content
          mimeType: file.type // Store the MIME type
        };
        setFiles([...files, newFile]);
        toast.success('File uploaded successfully!');
      };
      
      reader.readAsDataURL(file); // Read file as data URL
    }
  };

  const handleActionClick = (event) => {
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
  };

  const filteredFiles = files.filter(file => {
    const parentPath = currentPath === '/' ? '' : currentPath;
    const isDirectChild = file.path.startsWith(parentPath + '/') && 
                         file.path.split('/').length === currentPath.split('/').filter(Boolean).length + 2;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isDirectChild && matchesSearch;
  });

  const pathParts = currentPath.split('/').filter(Boolean);

  // Get all folders for move dialog
  const getAllFolders = () => {
    return files.filter(file => 
      file.type === 'folder' && 
      file.id !== selectedFile?.id && 
      !file.path.startsWith(selectedFile?.path || '')
    );
  };

  // Handle move operation
  const handleMove = () => {
    if (!selectedFile || !selectedDestination) return;

    const newPath = selectedDestination === '/' 
      ? `/${selectedFile.name}`
      : `${selectedDestination}/${selectedFile.name}`;

    // Check if file/folder with same name exists in destination
    const exists = files.some(f => f.path === newPath);
    if (exists) {
      toast.error('An item with this name already exists in the destination folder!');
      return;
    }

    // If moving a folder, update all children paths too
    setFiles(files.map(file => {
      if (file.id === selectedFile.id) {
        return { ...file, path: newPath };
      }
      // Update paths of all children if moving a folder
      if (selectedFile.type === 'folder' && file.path.startsWith(selectedFile.path + '/')) {
        const relativePath = file.path.slice(selectedFile.path.length);
        return { ...file, path: newPath + relativePath };
      }
      return file;
    }));

    setMoveDialog(false);
    setSelectedDestination('/');
    toast.success('Item moved successfully!');
  };

  const handleDownload = async (item) => {
    setIsDownloading(true);
    try {
      if (item.type === 'folder') {
        // Create a new zip file
        const zip = new JSZip();
        
        // Add all files from the folder to zip
        const folderFiles = files.filter(f => 
          f.path.startsWith(item.path + '/') && f.type !== 'folder'
        );

        // Add actual file content to zip
        folderFiles.forEach(file => {
          if (file.content) {
            // Convert data URL back to blob
            const contentParts = file.content.split(',');
            const contentType = contentParts[0].split(':')[1].split(';')[0];
            const contentData = atob(contentParts[1]);
            const contentArray = new Uint8Array(contentData.length);
            for (let i = 0; i < contentData.length; i++) {
              contentArray[i] = contentData.charCodeAt(i);
            }
            const blob = new Blob([contentArray], { type: contentType });
            
            const relativePath = file.path.slice(item.path.length + 1);
            zip.file(relativePath, blob);
          }
        });

        // Generate zip file
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${item.name}.zip`);
        toast.success('Folder downloaded as zip successfully!');
      } else {
        // For single file download
        if (item.content) {
          // Convert data URL back to blob
          const contentParts = item.content.split(',');
          const contentType = contentParts[0].split(':')[1].split(';')[0];
          const contentData = atob(contentParts[1]);
          const contentArray = new Uint8Array(contentData.length);
          for (let i = 0; i < contentData.length; i++) {
            contentArray[i] = contentData.charCodeAt(i);
          }
          const blob = new Blob([contentArray], { type: item.mimeType });
          saveAs(blob, item.name);
          toast.success('File downloaded successfully!');
        } else {
          toast.error('File content not available');
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    // Check for existing token on component mount
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const expiry = localStorage.getItem('tokenExpiry');
      
      if (token && expiry) {
        // Check if token is expired
        if (new Date(expiry) > new Date()) {
          try {
            const decoded = JSON.parse(atob(token));
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Token decode error:', error);
            handleLogout();
          }
        } else {
          // Token expired, clear storage
          handleLogout();
        }
      }
    };

    checkAuth();

    // Set up interval to check token expiry
    const interval = setInterval(() => {
      const expiry = localStorage.getItem('tokenExpiry');
      if (expiry && new Date(expiry) <= new Date()) {
        handleLogout();
        toast.error('Session expired. Please login again.');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (token) => {
    try {
      const decoded = JSON.parse(atob(token));
      setIsAuthenticated(true);
      toast.success(`Welcome ${decoded.username}!`);
    } catch (error) {
      console.error('Token decode error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    setIsAuthenticated(false);
    setCurrentPath('/');
    setSelectedFile(null);
    setSearchQuery('');
    toast.info('Logged out successfully');
  };

  const handleCreateFolderClick = () => {
    setCreateFolderDialog(true);
  };

  const handleCreateFileClick = () => {
    setCreateFileDialog(true);
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = handleUpload;
    input.click();
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            NAS File Manager
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 1,
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
              }}
            />
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Hidden file input for upload */}
      <input
        type="file"
        hidden
        ref={setUploadInput}
        onChange={handleUpload}
        multiple
      />

      {/* Sidebar */}
      <Drawer
        variant={window.innerWidth < 600 ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 260,
            backgroundColor: '#1a2234',
            color: '#fff',
            borderRight: 'none'
          },
        }}
      >
        <Toolbar sx={{ backgroundColor: '#1a2234', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            FILE MANAGER
          </Typography>
          <IconButton 
            onClick={() => setSidebarOpen(false)}
            sx={{ 
              color: '#fff',
              display: { sm: 'none' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ backgroundColor: '#2d3546' }} />
        <List>
          <ListItem sx={{ mb: 1 }}>
            <CreateNewButton
              onCreateFolder={() => setCreateFolderDialog(true)}
              onCreateFile={() => setCreateFileDialog(true)}
              onUploadFile={() => uploadInput?.click()}
            />
          </ListItem>
          {sidebarItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={item.onClick}
              sx={{
                color: '#9899ac',
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                },
                mx: 1,
                borderRadius: 1
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          bgcolor: '#f5f6fa',
          ml: { sm: '260px' },
          width: { sm: `calc(100% - 260px)` },
          pt: '64px' // Add padding top to account for fixed header
        }}
      >
        <Box sx={{ 
          p: { xs: 1, sm: 2, md: 3 }, 
          overflow: 'auto', 
          height: 'calc(100vh - 64px)'
        }}>
          {filteredFiles.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: '#5e6278'
            }}>
              <InsertDriveFile sx={{ fontSize: 60, mb: 2, color: '#b5b5c3' }} />
              <Typography variant="h6">No files or folders</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Create a new folder or upload files to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<CreateNewFolder />}
                onClick={() => setCreateFolderDialog(true)}
                sx={{ mt: 2 }}
              >
                Create Folder
              </Button>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {filteredFiles.map((file) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={file.id}>
                  <Paper
                    elevation={selectedFile?.id === file.id ? 8 : 1}
                    sx={{
                      p: { xs: 1, sm: 2 },
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f8f9fa' },
                      backgroundColor: selectedFile?.id === file.id ? '#e8f0fe' : '#fff',
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => handleFileClick(file, e)}
                    onContextMenu={(e) => handleFileClick(file, e)}
                  >
                    <Box sx={{ 
                      transform: { xs: 'scale(0.8)', sm: 'scale(1)' },
                      mb: { xs: 0.5, sm: 1 }
                    }}>
                      {getFileIcon(file.type)}
                    </Box>
                    <Typography 
                      noWrap 
                      sx={{ 
                        color: '#5e6278',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        width: '100%',
                        textAlign: 'center',
                        mt: { xs: 0.5, sm: 1 }
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#b5b5c3',
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        mt: 0.5
                      }}
                    >
                      {file.size} {file.type === 'folder' ? `• ${file.fileCount} Files` : ''}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      sx={{
                        position: 'absolute',
                        top: { xs: 2, sm: 4 },
                        right: { xs: 2, sm: 4 },
                        padding: { xs: '4px', sm: '8px' },
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                          backgroundColor: '#e3f2fd',
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: { xs: '1.2rem', sm: '1.5rem' }
                        }
                      }}
                    >
                      {file.type === 'folder' ? <FolderZip /> : <FileDownload />}
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={() => {
          setCreateFolderDialog(true);
          handleActionClose();
        }}>
          <ListItemIcon>
            <CreateNewFolder fontSize="small" />
          </ListItemIcon>
          <ListItemText>New Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setCreateFileDialog(true);
          handleActionClose();
        }}>
          <ListItemIcon>
            <NoteAdd fontSize="small" />
          </ListItemIcon>
          <ListItemText>New File</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          uploadInput?.click();
          handleActionClose();
        }}>
          <ListItemIcon>
            <Upload fontSize="small" />
          </ListItemIcon>
          <ListItemText>Upload File</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <Dialog open={createFolderDialog} onClose={() => setCreateFolderDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFolderDialog(false)}>Cancel</Button>
          <Button onClick={() => handleCreate('folder')} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createFileDialog} onClose={() => setCreateFileDialog(false)}>
        <DialogTitle>Create New File</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFileDialog(false)}>Cancel</Button>
          <Button onClick={() => handleCreate('file')} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={renameDialog} onClose={() => setRenameDialog(false)}>
        <DialogTitle>Rename Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog(false)}>Cancel</Button>
          <Button onClick={handleRename} variant="contained">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move Dialog */}
      <Dialog 
        open={moveDialog} 
        onClose={() => {
          setMoveDialog(false);
          setSelectedDestination('/');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Move {selectedFile?.name}</DialogTitle>
        <DialogContent>
          <List sx={{ pt: 1 }}>
            <ListItem 
              button 
              onClick={() => setSelectedDestination('/')}
              selected={selectedDestination === '/'}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Root Directory" />
            </ListItem>
            <Divider />
            {getAllFolders().map((folder) => (
              <ListItem
                button
                key={folder.id}
                onClick={() => setSelectedDestination(folder.path)}
                selected={selectedDestination === folder.path}
                sx={{
                  borderRadius: 1,
                  my: 1,
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <Folder sx={{ color: '#FFA000' }} />
                </ListItemIcon>
                <ListItemText 
                  primary={folder.name}
                  secondary={folder.path}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMoveDialog(false);
            setSelectedDestination('/');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            variant="contained"
            disabled={!selectedDestination}
          >
            Move Here
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => {
          setRenameDialog(true);
          setContextMenu(null);
        }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          setMoveDialog(true);
          setContextMenu(null);
        }}>
          <ListItemIcon><DriveFileMove fontSize="small" /></ListItemIcon>
          <ListItemText>Move to</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDownload(selectedFile);
            setContextMenu(null);
          }}
        >
          <ListItemIcon>
            {selectedFile?.type === 'folder' ? (
              <FolderZip fontSize="small" />
            ) : (
              <FileDownload fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedFile?.type === 'folder' ? 'Download as ZIP' : 'Download'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(selectedFile);
          setContextMenu(null);
        }}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <ToastContainer position="bottom-right" />
    </Box>
  );
}

export default App; 
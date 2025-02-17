import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CssVarsProvider, extendTheme, useColorScheme } from '@mui/joy/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { DiscordLogoIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useSession } from '../Components/SessionContext';
import { useNavigate } from 'react-router-dom';

const session = axios.create();

const Login = ({ baseUrl }) => {
    const { login: saveToken } = useSession();
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => setMounted(true), []);

    const login = (email, password) => {
        const url = `${baseUrl}/login`;
        return session.post(url, { email, password })
            .then((response) => {
                const token = response.data.token;
                if (token) {
                    session.defaults.headers['Authorization'] = token;
                    saveToken(token, response.data.u, response.data.r, response.data.lastLogin, response.data.role, response.data.urlAvatar, email);
                    navigate('/drive');
                    return token;
                } else {
                    throw new Error('No token received');
                }
            });
    };

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const formElements = event.currentTarget.elements;
        const email = formElements.email.value;
        const password = formElements.password.value;

        const loginPromise = login(email, password);

        toast.promise(loginPromise, {
            loading: 'Logging in...',
            success: 'Logged in successfully!',
            error: 'Please check your credentials or server status',
        });
    };

    const ColorSchemeToggle = (props) => {
        const { onClick, ...other } = props;
        const { mode, setMode } = useColorScheme();

        return (
            <IconButton
                aria-label="toggle light/dark mode"
                size="sm"
                variant="outlined"
                disabled={!mounted}
                onClick={(event) => {
                    setMode(mode === 'light' ? 'dark' : 'light');
                    if (onClick) onClick();
                }}
                {...other}
            >
                {mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
            </IconButton>
        );
    };

    const customTheme = extendTheme();

    return (
        <CssVarsProvider theme={customTheme} disableTransitionOnChange>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    ':root': {
                        '--Form-maxWidth': '800px',
                        '--Transition-duration': 'none',
                    },
                }}
            />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: 'background.level1',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        maxWidth: '400px',
                        px: 2,
                        backgroundColor: 'rgba(255 255 255 / 0.2)',
                        borderRadius: 'sm',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                >
                    <Box
                        component="header"
                        sx={{ py: 3, display: 'flex', justifyContent: 'space-between' }}
                    >
                        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                            <IconButton variant="soft" color="primary" size="sm">
                                <BadgeRoundedIcon />
                            </IconButton>
                            <Typography level="title-lg">AbissoHub Drive</Typography>
                        </Box>
                        <ColorSchemeToggle />
                    </Box>
                    <Box
                        component="main"
                        sx={{
                            my: 'auto',
                            py: 2,
                            pb: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            width: '100%',
                            maxWidth: '100%',
                            mx: 'auto',
                            '& form': {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            },
                            [`& .MuiFormLabel-asterisk`]: {
                                visibility: 'hidden',
                            },
                        }}
                    >
                        <Stack sx={{ gap: 4, mb: 2 }}>
                            <Stack sx={{ gap: 1 }}>
                                <Typography component="h1" level="h3">
                                    Sign in
                                </Typography>
                            </Stack>
                            <Button
                                variant="soft"
                                color="neutral"
                                fullWidth
                                startDecorator={<DiscordLogoIcon />}
                                disabled={true}
                            >
                                Continue with Discord
                            </Button>
                        </Stack>
                        <Divider
                            sx={(theme) => ({
                                [theme.getColorSchemeSelector('light')]: {
                                    color: { xs: '#FFF', md: 'text.tertiary' },
                                },
                            })}
                        >
                            or
                        </Divider>
                        <Stack sx={{ gap: 4, mt: 2 }}>
                            <form onSubmit={handleLoginSubmit}>
                                <FormControl required>
                                    <FormLabel>Email</FormLabel>
                                    <Input type="email" name="email" maxLength="254" />
                                </FormControl>
                                <FormControl required>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" name="password" maxLength="64" />
                                </FormControl>
                                <Stack sx={{ gap: 4, mt: 2 }}>
                                    <Button type="submit" fullWidth>
                                        Sign in
                                    </Button>
                                </Stack>
                            </form>
                        </Stack>
                    </Box>
                    <Box component="footer" sx={{ py: 3 }}>
                        <Typography level="body-xs" sx={{ textAlign: 'center' }}>
                            © AbissoHub {new Date().getFullYear()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </CssVarsProvider>
    );
};

export default Login;

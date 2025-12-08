import { useState } from 'react';
import { Button, Card, Typography, Container, Box, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useHttp } from '../../hooks/http';
import { useToken } from '../../hooks/token';
import { IUserLoginRequestModel } from '../../models/userModel';

export default function LoginView() {
    const { handlePostRequest } = useHttp();
    const { setToken } = useToken();
    const navigate = useNavigate();

    const [userWhatsAppNumber, setUserWhatsAppNumber] = useState('');
    const [userPassword, setUserPassword] = useState('');

    const handleSubmit = async () => {
        try {
            const payload: IUserLoginRequestModel = {
                userWhatsAppNumber,
                userPassword,
            };

            const result = await handlePostRequest({
                path: '/admins/login',
                body: payload,
            });

            if (result !== null) {
                setToken(result.data.token);
                window.location.reload();
                navigate('/');
            }
        } catch (error: unknown) {
            console.log(error);
        }
    };

    return (
        <>
            <Container maxWidth="xs">
                <Card
                    sx={{
                        mt: 5,
                        p: 8,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography
                        variant="h4"
                        marginBottom={5}
                        color="primary"
                        textAlign={'center'}
                        fontWeight={'bold'}
                    >
                        Login
                    </Typography>
                    <Box
                        component="form"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <TextField
                            label="Whatsapp"
                            id="outlined-start-adornment"
                            sx={{ m: 1, width: '100%' }}
                            value={userWhatsAppNumber}
                            type="text"
                            onChange={(e) => {
                                setUserWhatsAppNumber(e.target.value);
                            }}
                        />

                        <TextField
                            label="Password"
                            id="outlined-start-adornment"
                            sx={{ m: 1, width: '100%' }}
                            value={userPassword}
                            type="password"
                            onChange={(e) => {
                                setUserPassword(e.target.value);
                            }}
                        />
                        <Button
                            sx={{
                                m: 1,
                                backgroundColor: 'dodgerblue',
                                color: '#FFF',
                                width: '100%',
                                fontWeight: 'bold',
                            }}
                            variant={'contained'}
                            onClick={handleSubmit}
                        >
                            Login
                        </Button>
                    </Box>
                </Card>
            </Container>
        </>
    );
}

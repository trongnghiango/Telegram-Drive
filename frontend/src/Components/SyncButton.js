import React, { useState } from 'react';
import Button from '@mui/joy/Button';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { toast } from 'sonner';
import { useSession } from './SessionContext';


const SyncButton = ({baseUrl}) => {
    const [countdown, setCountdown] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);
    const { token } = useSession();


    const syncDrive = async () => {
        const url = `${baseUrl["baseUrl"]}/sync-drive`;
        const fetchPromise = fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`,

            },
        });

        toast.promise(fetchPromise, {
            loading: 'Syncing files...',
            success: async (response) => {
                const result = await response.json();
                return result.message || 'Files synced successfully!';
            },
            error: (error) => error.message || 'Failed to sync files.',
        });

        return fetchPromise;
    };

    const handleClick = () => {
        setIsDisabled(true);
        setCountdown(30);

        syncDrive();

        const timer = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown <= 1) {
                    clearInterval(timer);
                    setIsDisabled(false);
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);
    };

    return (
        <>
            <Button
                variant="solid"
                color="primary"
                sx={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '10px',
                    backgroundColor: isDisabled ? '#6c757d' : '#28a745',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: isDisabled ? '#6c757d' : '#218838',
                    },
                }}
                startDecorator={!isDisabled && <CloudSyncIcon />}
                disabled={isDisabled}
                onClick={handleClick}
            >
                {isDisabled ? `Retry in ${countdown}s` : 'Sync Files'}
            </Button>
        </>
    );
};

export default SyncButton;

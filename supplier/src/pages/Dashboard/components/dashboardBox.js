import { Box, Paper, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const DashboardBox = ({ title, count, icon, color, grow, prefix = "", isLoading }) => {
    const formatNumber = (num) => {
        return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
    };

    return (
        <Paper sx={{
            background: `linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%)`,
            borderRadius: '16px',
            padding: '24px',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-5px)'
            }
        }}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                right: '-20px',
                transform: 'translateY(-50%)',
                opacity: 0.2,
                fontSize: '120px'
            }}>
                {icon}
            </Box>

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" sx={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 500,
                    mb: 2,
                    opacity: 0.9
                }}>
                    {title}
                </Typography>

                {isLoading ? (
                    <Skeleton 
                        variant="text" 
                        width="60%" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} 
                    />
                ) : (
                    <Typography variant="h4" sx={{
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '28px',
                        mb: 1
                    }}>
                        {prefix}{formatNumber(count)}
                    </Typography>
                )}

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: '#fff',
                    opacity: 0.9
                }}>
                    {grow ? (
                        <TrendingUpIcon sx={{ fontSize: 20 }} />
                    ) : (
                        <TrendingDownIcon sx={{ fontSize: 20 }} />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {grow ? '+10%' : '-5%'} vs last month
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default DashboardBox;
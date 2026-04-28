// Control para aumentar o disminuir cantidad.

import { Button, Stack, Typography } from '@mui/material';

export const CartQuantityControl = ({ value = 1, onMinus, onPlus }) => <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Button onClick={onMinus}>-</Button><Typography>{value}</Typography><Button onClick={onPlus}>+</Button></Stack>;

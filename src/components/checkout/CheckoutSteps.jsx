// Indicador de pasos del checkout.

import { Step, StepLabel, Stepper } from '@mui/material';

export const CheckoutSteps = ({ activeStep = 0 }) => <Stepper activeStep={activeStep}><Step><StepLabel>Carrito</StepLabel></Step><Step><StepLabel>Pago</StepLabel></Step><Step><StepLabel>Confirmación</StepLabel></Step></Stepper>;

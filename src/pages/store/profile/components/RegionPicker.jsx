import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import * as ubigeoPeru from 'ubigeo-peru';

export const RegionPicker = ({ value = {}, onChange }) => {
    const [ubigeo, setUbigeo] = useState({
        departamento: value.departamento ?? '',
        provincia: value.provincia ?? '',
        distrito: value.distrito ?? '',
    });

    useEffect(() => {
      setUbigeo({
        departamento: value.departamento ?? '',
        provincia: value.provincia ?? '',
        distrito: value.distrito ?? '',
      });
    }, [value.departamento, value.provincia, value.distrito]);

    const listaRaw = useMemo(() => {
        const raw = ubigeoPeru.inei || ubigeoPeru.default?.inei || [];
        return raw.map((item) => {
            if (item.departamento === '01' && item.nombre === 'Bagua' && item.provincia === '00' && item.distrito === '00') {
                return { ...item, provincia: '02' }; 
            }
            return item;
        });
    }, []);

    const departamentos = useMemo(() => {
        const deptoMap = {};
        
        listaRaw.forEach(item => {
            if (item.provincia === '00' && item.distrito === '00' && item.departamento !== '00') {
                deptoMap[item.departamento] = item.nombre; // Evita duplicados por propiedad de objeto
            }
        });

        return Object.entries(deptoMap)
        .map(([id, nombre]) => ({ id, nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [listaRaw]);

    const provinces = useMemo(() => {
        if (!ubigeo.departamento) return [];
        
        const provMap = {};
        
        listaRaw.forEach(item => {
        if (item.departamento === ubigeo.departamento && item.provincia !== '00' && item.distrito === '00') {
            const idUnico4 = `${item.departamento}${item.provincia}`;
            provMap[idUnico4] = item.nombre;
        }
        });

        return Object.entries(provMap)
        .map(([id, nombre]) => ({ id, nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [ubigeo.departamento, listaRaw]);

    // 4. Distritos blindados contra duplicados
    const distritos = useMemo(() => {
        if (!ubigeo.provincia) return [];
        
        const distMap = {};
        
        listaRaw.forEach(item => {
        const codigoProvinciaFila = `${item.departamento}${item.provincia}`;
        if (codigoProvinciaFila === ubigeo.provincia && item.distrito !== '00') {
            const idUnico6 = `${item.departamento}${item.provincia}${item.distrito}`;
            distMap[idUnico6] = item.nombre;
        }
        });

        return Object.entries(distMap)
        .map(([id, nombre]) => ({ id, nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [ubigeo.provincia, listaRaw]);

    const handleDepartamentoChange = (e) => {
        const next = { departamento: e.target.value, provincia: '', distrito: '' };
        setUbigeo(next);
        onChange?.(next);
    };

    const handleProvinciaChange = (e) => {
        const next = { ...ubigeo, provincia: e.target.value, distrito: '' };
        setUbigeo(next);
        onChange?.(next);
    };

    const handleDistritoChange = (e) => {
        const next = { ...ubigeo, distrito: e.target.value };
        setUbigeo(next);
        onChange?.(next);
    };

    return (
        <Box>
            <Grid container spacing={2}>
              
            {/* DEPARTAMENTO */}
             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Departamento"
                  value={ubigeo.departamento}
                  onChange={handleDepartamentoChange}
                >
                  {departamentos.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* PROVINCIA */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Provincia"
                  value={ubigeo.provincia}
                  onChange={handleProvinciaChange}
                  disabled={!ubigeo.departamento}
                >
                  {provinces.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* DISTRITO */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Distrito"
                  value={ubigeo.distrito}
                  onChange={handleDistritoChange}
                  disabled={!ubigeo.provincia}
                >
                  {distritos.map((dist) => (
                    <MenuItem key={dist.id} value={dist.id}>
                      {dist.nombre}
                    </MenuItem>
                  ))}
                </TextField>
             </Grid>

            </Grid>
          </Box>      
  );
}
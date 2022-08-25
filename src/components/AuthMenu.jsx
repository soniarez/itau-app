import React, { useState, useEffect } from 'react';
import { onSnapshot, collection, db, updateDoc, doc } from '../firebase/init';
import { DataGrid, GridToolbar, esES } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import AuthMenuChart from './AuthMenuChart';
import '../../src/App.css';

const AuthMenu = () => {
  const [data, setData] = useState([]);

  const columns = [
    {
      field: 'date',
      headerName: 'Fecha y Hora',
      width: 150,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'left',
    },
    {
      field: 'company',
      headerName: 'Empresa',
      width: 170,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'left',
    },
    {
      field: 'origen',
      headerName: 'Cuenta Origen',
      width: 110,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'center',
    },
    {
      field: 'solution',
      headerName: 'Solución',
      width: 168,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'left',
    },
    {
      field: 'amount',
      headerName: 'Monto',
      width: 150,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'center',
    },
    {
      field: 'details',
      headerName: 'Detalles',
      width: 65,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'center',
      renderCell: params => {
        return (
          <div>
            {data ? (
              <div>
                {/*  <Checkbox
                  size="small"
                  icon={<FolderOpenIcon/>}
                  checkedIcon={<FolderOpenIcon />}
                  sx={{
                    '&.Mui-checked': {
                      
                      color: '#F1AE2F',
                    },
                  }}
                /> */}
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    color: '#f5ac4a',
                    display: 'inline',
                    fontWeight: 'bold',
                    mx: 0.5,
                    fontSize: 9,
                  }}
                >
                  Más detalles
                </Button>
              </div>
            ) : (
              <p>Data is loading...</p>
            )}
          </div>
        );
      },
    },
    {
      field: 'autorize',
      headerName: 'Autorizar',
      width: 70,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'center',
      renderCell: params => {
        return (
          <div>
            {data ? (
              <div>
                <Checkbox
                  onChange={e => handleChangeAuthorized(e, params.row.docId)}
                  checked={params.row.isAuthorized}
                  size="small"
                  sx={{
                    '&.Mui-checked': {
                      color: '#5db761',
                    },
                  }}
                />
              </div>
            ) : (
              <p>Data is loading...</p>
            )}
          </div>
        );
      },
    },
    {
      field: 'reject',
      headerName: 'Rechazar',
      width: 70,
      headerAlign: 'center',
      headerClassName: 'itau-app',
      align: 'center',
      renderCell: params => {
        return (
          <div>
            {data ? (
              <div>
                <Checkbox
                  onChange={e => handleChangeRejected(e, params.row.docId)}
                  checked={params.row.isRejected}
                  size="small"
                  sx={{
                    '&.Mui-checked': {
                      color: '#f44336',
                    },
                  }}
                />
              </div>
            ) : (
              <p>Data is loading...</p>
            )}
          </div>
        );
      },
    },
  ];

  //GETTING DATA FROM FIREBASE
  useEffect(() => {
    onSnapshot(collection(db, 'transaction'), snapshot => {
      const dataFromFirestore = snapshot.docs.map(doc => {
        return {
          docId: doc.id,
          isAuthorized: false,
          isRejected: false,
          ...doc.data(),
        };
      });
      setData(dataFromFirestore);
    });
  }, []);

  //HANDLECHANGE AUTHORIZE
  const handleChangeAuthorized = (e, docId) => {
    setData(prevState => [
      ...prevState.map(element => {
        return element.docId === docId
          ? {
              ...element,
              isAuthorized: !element.isAuthorized,
            }
          : element;
      }),
    ]);
  };

  //HANDLECHANGE REJECT
  const handleChangeRejected = (e, docId) => {
    setData(prevState => [
      ...prevState.map(element => {
        return element.docId === docId
          ? {
              ...element,
              isRejected: !element.isRejected,
            }
          : element;
      }),
    ]);
  };

  //FILTERING PENDING
  const pendingTransactions = data.filter(item => {
    return item.status === 'pendiente';
  });

  //EXECUTE TRANSACTION
  const sendTransaction = () => {
    const authorizeTransactions = data.filter(
      item => item.isAuthorized === true
    );
    const rejectedTransactions = data.filter(item => item.isRejected === true);

    if (authorizeTransactions) {
      const authorizeArr = authorizeTransactions.map(item => {
        const sendTransaction = doc(db, 'transaction', item.docId);

        updateDoc(sendTransaction, {
          status: 'aprobada',
        });
      });
    }

    if (rejectedTransactions) {
      const rejectedArr = rejectedTransactions.map(item => {
        const sendTransaction = doc(db, 'transaction', item.docId);
        updateDoc(sendTransaction, {
          status: 'rechazada',
        });
      });
    }
  };

  return (
    <div>
      <h2>Autorizar Transacciones Multiempresa: </h2>
      <div className="flex flex-row justify-evenly">
    
          <button className='mr-12 bg-[#FFFFFF] border-[#6aec00fd] border text-[#00ec1fb2] font-bolds rounded-2xl w-[120px] h-[35px] text-sm hover:bg-[#FFE6CE]'>
           Aceptar todo
          </button>
          <button className='mr-12 bg-[#FFFFFF] border-[#ec1000] border text-[#ec2f00] font-bolds rounded-2xl w-[120px] h-[35px] text-sm hover:bg-[#FFE6CE]'>
           Rechazar todo
          </button>
       
      </div>

      <div style={{ height: 430, width: '66%' }}>

        <DataGrid
          rowHeight={25}
          columns={columns}
          rows={pendingTransactions}
          pageSize={10}
          rowsPerPageOptions={[10]}
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            boxShadow: 2,
            fontSize: 11,
            m: 2,
            textAlign: 'center',
            '& .itau-app-USD': {
              bgcolor: '#B4B4B4',
            },
          }}
          getRowClassName={params => `itau-app-${params.row.amount}`}
        />
      </div>
      <button className='mr-12 bg-[#f89719] border-[#ec7e00fd] border text-[#0c0902b2] font-bolds rounded-2xl w-[120px] h-[35px] text-sm hover:bg-[#FFE6CE]'
          onClick={() => sendTransaction()}>Ejecutar</button>
      <div>
        <div className='flex-1'>
        <AuthMenuChart data={data} />
      </div>
      </div>
    </div>
  );
};

export default AuthMenu;

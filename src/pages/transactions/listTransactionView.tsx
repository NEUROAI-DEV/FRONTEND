/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from '@mui/material/Box';
import {
    GridRowsProp,
    DataGrid,
    GridColDef,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarExport,
} from '@mui/x-data-grid';
import { MoreOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useHttp } from '../../hooks/http';
import { Button, Stack, TextField } from '@mui/material';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { useNavigate } from 'react-router-dom';
import { convertTime } from '../../utilities/convertTime';
import { convertNumberToCurrency } from '../../utilities/convertNumberToCurrency';

export default function ListTransactionView() {
    const navigation = useNavigate();
    const [tableData, setTableData] = useState<GridRowsProp[]>([]);
    const { handleGetTableDataRequest } = useHttp();

    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });

    const getTableData = async ({ search }: { search: string }) => {
        try {
            setLoading(true);
            const result = await handleGetTableDataRequest({
                path: '/orders',
                page: paginationModel.page ?? 0,
                size: paginationModel.pageSize ?? 10,
                filter: { search, orderStatus: 'done' },
            });
            if (result) {
                const mapingData = result.items.map((item: any) => {
                    return {
                        ...item,
                        userName: item?.user?.userName,
                        orderProductName: item?.product?.productName,
                    };
                });

                setTableData(mapingData);
                setRowCount(result.total_items);
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTableData({ search: '' });
    }, [paginationModel]);

    const columns: GridColDef[] = [
        {
            field: 'userName',
            flex: 1,
            renderHeader: () => <strong>{'Pembeli'}</strong>,
            editable: true,
        },
        {
            field: 'orderProductName',
            flex: 1,
            renderHeader: () => <strong>{'Produk'}</strong>,
            editable: true,
        },
        {
            field: 'orderTotalProductPrice',
            flex: 1,
            renderHeader: () => <strong>{'Harga'}</strong>,
            editable: true,
            renderCell: (item) => {
                const calculateTotal = item.row.orderTotalProductPrice * item.row.orderTotalItem;
                return 'Rp' + convertNumberToCurrency(calculateTotal);
            },
        },
        {
            field: 'createdAt',
            flex: 1,
            renderHeader: () => <strong>{'Dipesan pada'}</strong>,
            editable: true,
            valueFormatter: (item) => convertTime(item.value),
        },
        {
            field: 'actions',
            type: 'actions',
            renderHeader: () => <strong>{'Aksi'}</strong>,
            flex: 1,
            cellClassName: 'actions',
            getActions: ({ row }) => {
                return [
                    <GridActionsCellItem
                        icon={<MoreOutlined color="info" />}
                        label="Detail"
                        onClick={() => navigation('/transactions/detail/' + row.orderId)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    function CustomToolbar() {
        const [search, setSearch] = useState<string>('');
        return (
            <GridToolbarContainer sx={{ justifyContent: 'space-between', mb: 2 }}>
                <Stack direction="row" spacing={2}>
                    <GridToolbarExport />
                </Stack>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                    <TextField
                        size="small"
                        placeholder="search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="outlined" onClick={() => getTableData({ search })}>
                        Search
                    </Button>
                </Stack>
            </GridToolbarContainer>
        );
    }

    return (
        <>
            <BreadCrumberStyle
                navigation={[
                    {
                        label: 'Riwayat Transaksi',
                        link: '/transactions',
                        icon: <IconMenus.transaction fontSize="small" />,
                    },
                ]}
            />
            <Box
                sx={{
                    width: '100%',
                    '& .actions': {
                        color: 'text.secondary',
                    },
                    '& .textPrimary': {
                        color: 'text.primary',
                    },
                }}
            >
                <DataGrid
                    rows={tableData}
                    columns={columns}
                    getRowId={(row) => row.transactionId}
                    editMode="row"
                    sx={{ backgroundColor: 'white', borderRadius: 2, p: 2 }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 2, page: 0 } },
                    }}
                    pageSizeOptions={[2, 5, 10, 25]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    autoHeight
                    rowCount={rowCount}
                    paginationMode="server"
                    loading={loading}
                />
            </Box>
        </>
    );
}

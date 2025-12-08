import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import {
    GridRowsProp,
    DataGrid,
    GridColDef,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarExport,
} from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useHttp } from '../../../hooks/http';
import { Button, Stack, TextField } from '@mui/material';
import BreadCrumberStyle from '../../../components/breadcrumb/Index';
import { IconMenus } from '../../../components/icon';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../../components/modal';
import { ICategory } from '../../../interfaces/Category';

export default function ListSubCategoryView() {
    const navigation = useNavigate();
    const { categoryReference } = useParams<{ categoryReference: string }>();

    const [tableData, setTableData] = useState<GridRowsProp[]>([]);
    const { handleGetTableDataRequest, handleRemoveRequest } = useHttp();
    const [modalDeleteData, setModalDeleteData] = useState<ICategory>();
    const [openModalDelete, setOpenModalDelete] = useState<boolean>(false);

    const [loading, setLoading] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0,
    });

    const handleDeleteCategory = async (categoryId: string) => {
        await handleRemoveRequest({
            path: '/categories?categoryId=' + categoryId,
        });
        await getTableData({ search: '' });
    };

    const handleOpenModalDelete = (data: ICategory) => {
        setModalDeleteData(data);
        setOpenModalDelete(!openModalDelete);
    };

    const getTableData = async ({ search }: { search: string }) => {
        try {
            setLoading(true);
            const result = await handleGetTableDataRequest({
                path: '/categories',
                page: paginationModel.page ?? 0,
                size: paginationModel.pageSize ?? 10,
                filter: {
                    search,
                    categoryReference,
                    categoryType: 'child',
                },
            });
            if (result) {
                setTableData(result.items);
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
            field: 'categoryReference',
            flex: 1,
            renderHeader: () => <strong>{'PARENT ID'}</strong>,
            editable: true,
        },
        {
            field: 'categoryId',
            flex: 1,
            renderHeader: () => <strong>{'ID'}</strong>,
            editable: true,
        },
        {
            field: 'categoryName',
            flex: 1,
            renderHeader: () => <strong>{'NAMA'}</strong>,
            editable: true,
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
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={() => navigation('edit/' + row.categoryId)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon color="error" />}
                        label="Delete"
                        onClick={() => handleOpenModalDelete(row)}
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
                    <Button
                        onClick={() => navigation('create')}
                        startIcon={<Add />}
                        variant="outlined"
                    >
                        Tambah Kategori
                    </Button>
                </Stack>
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                    <TextField
                        size="small"
                        placeholder="cari..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="outlined" onClick={() => getTableData({ search })}>
                        Cari
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
                        label: 'Category',
                        link: '/categories/subcategories/',
                        icon: <IconMenus.category fontSize="small" />,
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
                    getRowId={(row) => row.categoryId}
                    columns={columns}
                    editMode="row"
                    sx={{ backgroundColor: 'white', borderRadius: 2, p: 2 }}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10, page: 0 } },
                    }}
                    pageSizeOptions={[2, 5, 10, 25]}
                    autoHeight
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    rowCount={rowCount}
                    paginationMode="server"
                    loading={loading}
                />
            </Box>

            <Modal
                openModal={openModalDelete}
                handleModalOnCancel={() => setOpenModalDelete(false)}
                message={
                    'Apakah anda yakin ingin menghapus kategori ' + modalDeleteData?.categoryName
                }
                handleModal={() => {
                    handleDeleteCategory(modalDeleteData?.categoryId ?? '');
                    setOpenModalDelete(!openModalDelete);
                }}
            />
        </>
    );
}

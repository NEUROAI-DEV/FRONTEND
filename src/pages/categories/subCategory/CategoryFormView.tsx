import { useEffect, useState } from 'react';
import { Button, Card, Typography, Box, TextField, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHttp } from '../../../hooks/http';
import BreadCrumberStyle from '../../../components/breadcrumb/Index';
import { IconMenus } from '../../../components/icon';
import { subCategorySchema, SubCategoryFormValues } from '../../../validations/categorySchema';

export default function SubCategoryFormView() {
    const { categoryId, categoryReference } = useParams<{
        categoryId: string;
        categoryReference: string;
    }>();
    const { handlePostRequest, handleGetRequest, handleUpdateRequest } = useHttp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SubCategoryFormValues>({
        resolver: zodResolver(subCategorySchema),
        defaultValues: {
            categoryName: '',
            categoryReference,
            categoryType: 'child',
        },
    });

    const getCategory = async () => {
        try {
            const res = await handleGetRequest({ path: `/categories/detail/${categoryId}` });
            if (res) {
                reset({
                    categoryId: res.categoryId,
                    categoryName: res.categoryName,
                });
            }
        } catch (err) {
            console.error('Error fetching category:', err);
        }
    };

    useEffect(() => {
        if (!categoryId) return;
        getCategory();
    }, [categoryId, reset]);

    const onSubmit = async (data: SubCategoryFormValues) => {
        setLoading(true);
        try {
            if (categoryId) {
                await handleUpdateRequest({
                    path: `/categories`,
                    body: { ...data, categoryId },
                });
            } else {
                await handlePostRequest({
                    path: '/categories',
                    body: data,
                });
            }

            navigate(`/categories/subcategories/${categoryReference}`);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BreadCrumberStyle
                navigation={[
                    {
                        label: 'Category',
                        link: `/categories`,
                        icon: <IconMenus.category fontSize="small" />,
                    },
                    {
                        label: categoryId ? 'Edit' : 'Create',
                        link: categoryId
                            ? `/categories/subcategories/edit/${categoryId}/${categoryReference}`
                            : '/categories/subcategories/create',
                    },
                ]}
            />

            <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
                <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
                    {categoryId ? 'Edit Sub Kategori' : 'Tambah Sub Kategori'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Stack spacing={3}>
                        <Controller
                            name="categoryName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nama Kategori"
                                    fullWidth
                                    error={!!errors.categoryName}
                                    helperText={errors.categoryName?.message}
                                />
                            )}
                        />

                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ width: '25ch', fontWeight: 'bold' }}
                            >
                                {loading
                                    ? categoryId
                                        ? 'Updating...'
                                        : 'Submitting...'
                                    : categoryId
                                    ? 'Update'
                                    : 'Submit'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Card>
        </>
    );
}

import { useEffect, useState } from 'react';
import { Button, Card, Typography, Box, TextField, Stack, FormHelperText } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHttp } from '../../hooks/http';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { getImageUrl } from '../../utilities/getImageUrl';
import ButtonDeleteFile from '../../components/buttons/ButtonDeleteFile';
import { categorySchema, CategoryFormValues } from '../../validations/categorySchema';
import ButtonUploadWithOption from '../../components/buttons/ButtonUploadWithOption';

export default function CategoryFormView() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { handlePostRequest, handleGetRequest, handleUpdateRequest } = useHttp();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categoryIcon, setCategoryIcon] = useState<string>('');

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            categoryName: '',
            categoryIcon: '',
            categoryType: 'parent',
        },
    });

    const getCategory = async () => {
        try {
            const res = await handleGetRequest({ path: `/categories/detail/${categoryId}` });
            if (res) {
                reset({
                    categoryId: res.categoryId,
                    categoryName: res.categoryName,
                    categoryIcon: res.categoryIcon,
                });
                setCategoryIcon(res.categoryIcon || '');
            }
        } catch (err) {
            console.error('Error fetching category:', err);
        }
    };

    useEffect(() => {
        if (!categoryId) return;
        getCategory();
    }, [categoryId, reset]);

    useEffect(() => {
        setValue('categoryIcon', categoryIcon);
    }, [categoryIcon, setValue]);

    const onSubmit = async (data: CategoryFormValues) => {
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

            navigate('/categories');
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
                        link: '/categories',
                        icon: <IconMenus.category fontSize="small" />,
                    },
                    {
                        label: categoryId ? 'Edit' : 'Create',
                        link: categoryId ? `/categories/edit/${categoryId}` : '/categories/create',
                    },
                ]}
            />

            <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
                <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
                    {categoryId ? 'Edit Kategori' : 'Tambah Kategori'}
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

                        <Box>
                            <Typography color="text.secondary" mb={1}>
                                Icon Kategori (512×512 px, maks 2MB)
                            </Typography>

                            <Stack direction="row" flexWrap="wrap" spacing={2} alignItems="center">
                                {categoryIcon && (
                                    <Stack spacing={1} alignItems="center">
                                        <img
                                            src={getImageUrl(categoryIcon)}
                                            alt="category icon"
                                            style={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: 8,
                                                objectFit: 'cover',
                                            }}
                                        />
                                        <ButtonDeleteFile
                                            filename={categoryIcon}
                                            onDelete={() => setCategoryIcon('')}
                                        />
                                    </Stack>
                                )}

                                {!categoryIcon && (
                                    <Stack alignItems="center">
                                        {/* <ButtonUploadFile
                                            onUpload={(image) => setCategoryIcon(image)}
                                        /> */}
                                        <ButtonUploadWithOption
                                            onUpload={(image) => setCategoryIcon(image)}
                                        />
                                        <FormHelperText>Upload ikon kategori.</FormHelperText>
                                    </Stack>
                                )}
                            </Stack>
                        </Box>

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

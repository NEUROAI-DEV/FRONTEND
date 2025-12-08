import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Typography,
    Box,
    TextField,
    Stack,
    Select,
    MenuItem,
    Grid,
    InputLabel,
    FormControl,
    FormHelperText,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHttp } from '../../hooks/http';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { getImageUrl } from '../../utilities/getImageUrl';
import ButtonDeleteFile from '../../components/buttons/ButtonDeleteFile';
import { ICategoryModel } from '../../models/categoryModel';
import { ProductFormValues, productSchema } from '../../validations/productSchema';
import { IProduct, IProductCreate, IProductUpdate } from '../../interfaces/Product';
import ButtonUploadWithOption from '../../components/buttons/ButtonUploadWithOption';

export default function ProductFormView() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handlePostRequest, handleUpdateRequest, handleGetRequest } = useHttp();

    const [listCategory, setListCategory] = useState<ICategoryModel[]>([]);
    const [listSubCategory, setListSubCategory] = useState<ICategoryModel[]>([]);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            productName: '',
            productPrice: 0,
            productDiscount: 0,
            productStock: 0,
            productWeight: 0,
            productDescription: '',
            productCode: '',
            productImages: [],
        },
    });

    const getCategories = async () => {
        try {
            const res = await handleGetRequest({ path: '/categories?categoryType=parent' });
            setListCategory(res?.items || []);
        } catch (err) {
            console.error('fetch categories error', err);
        }
    };

    const getSubCategories = async (categoryReference: number) => {
        try {
            const res = await handleGetRequest({
                path: `/categories?categoryType=child&&categoryReference=${categoryReference}`,
            });
            setListSubCategory(res?.items || []);
        } catch (err) {
            console.error('fetch subcategories error', err);
        }
    };

    const getDetailProducts = async () => {
        try {
            setLoading(true);
            const res: IProduct = await handleGetRequest({
                path: `/products/detail/${productId}`,
            });

            if (res) {
                const images = res.productImages || [];
                setProductImages(images);

                reset({
                    productName: res.productName,
                    productDescription: res.productDescription,
                    productPrice: res.productPrice,
                    productStock: res.productStock,
                    productWeight: res.productWeight,
                    productDiscount: res.productDiscount,
                    productCategoryId: res.productCategoryId,
                    productSubCategoryId: res.productSubCategoryId,
                    productCode: res.productCode,
                    productImages: images,
                });
            }
        } catch (err) {
            console.error('fetch product error', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() => {
        if (!productId) return;
        getDetailProducts();
    }, [productId, reset]);

    useEffect(() => {
        setValue('productImages', productImages);
    }, [productImages, setValue]);

    // 🔹 Watch category selection and load subcategories dynamically
    const selectedCategoryId = watch('productCategoryId');
    useEffect(() => {
        if (selectedCategoryId) {
            getSubCategories(Number(selectedCategoryId));
            setValue('productSubCategoryId', 0); // reset subcategory when category changes
        } else {
            setListSubCategory([]);
            setValue('productSubCategoryId', 0);
        }
    }, [selectedCategoryId]);

    const handleDeleteImage = (oldImage: string) => {
        setProductImages((prev) => prev.filter((i) => i !== oldImage));
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        try {
            if (productId) {
                const payload: IProductUpdate = {
                    productId: Number(productId),
                    productName: data.productName,
                    productDescription: data.productDescription,
                    productImages: productImages,
                    productPrice: data.productPrice,
                    productCategoryId: data.productCategoryId,
                    productSubCategoryId: data.productSubCategoryId,
                    productStock: data.productStock,
                    productDiscount: data.productDiscount,
                    productWeight: data.productWeight,
                };
                await handleUpdateRequest({ path: '/products', body: payload });
            } else {
                const payload: IProductCreate = {
                    productName: data.productName,
                    productDescription: data.productDescription,
                    productImages: productImages,
                    productPrice: data.productPrice,
                    productCategoryId: data.productCategoryId,
                    productSubCategoryId: data.productSubCategoryId,
                    productStock: data.productStock,
                    productWeight: data.productWeight,
                    productDiscount: data.productDiscount,
                    productCode: data.productCode,
                };
                await handlePostRequest({ path: '/products', body: payload });
            }

            navigate('/products');
        } catch (error) {
            console.error('submit product error', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BreadCrumberStyle
                navigation={[
                    {
                        label: 'Product',
                        link: '/products',
                        icon: <IconMenus.products fontSize="small" />,
                    },
                    {
                        label: productId ? 'Edit' : 'Create',
                        link: productId ? `/products/edit/${productId}` : '/products/create',
                    },
                ]}
            />

            <Card sx={{ mt: 5, p: { xs: 3, md: 5 } }}>
                <Typography variant="h4" mb={5} color="primary" fontWeight="bold">
                    {productId ? 'Edit Product' : 'Tambah Product'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* === BASIC INFO === */}
                    <Grid container spacing={2} mb={5}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="productName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Nama Produk"
                                        fullWidth
                                        error={!!errors.productName}
                                        helperText={errors.productName?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="productPrice"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Harga (angka)"
                                        fullWidth
                                        type="number"
                                        onChange={(e) =>
                                            field.onChange(Number(e.target.value || 0))
                                        }
                                        error={!!errors.productPrice}
                                        helperText={errors.productPrice?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="productDiscount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Diskon (%)"
                                        fullWidth
                                        type="number"
                                        onChange={(e) =>
                                            field.onChange(Number(e.target.value || 0))
                                        }
                                        error={!!errors.productDiscount}
                                        helperText={errors.productDiscount?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="productWeight"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Berat (gram)"
                                        fullWidth
                                        type="number"
                                        onChange={(e) =>
                                            field.onChange(Number(e.target.value || 0))
                                        }
                                        error={!!errors.productWeight}
                                        helperText={errors.productWeight?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="productStock"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Stok"
                                        fullWidth
                                        type="number"
                                        onChange={(e) =>
                                            field.onChange(Number(e.target.value || 0))
                                        }
                                        error={!!errors.productStock}
                                        helperText={errors.productStock?.message}
                                    />
                                )}
                            />
                        </Grid>

                        {!productId && (
                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="productCode"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Kode Produk"
                                            fullWidth
                                            error={!!errors.productCode}
                                            helperText={errors.productCode?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        )}
                    </Grid>

                    {/* === IMAGE UPLOAD === */}
                    <Box mb={4}>
                        <Typography color="text.secondary">
                            Foto Produk (600×600 px & maks 2MB)
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" spacing={2} mt={2}>
                            {productImages.map((image, idx) => (
                                <Stack key={image + idx} spacing={1} alignItems="center">
                                    <img
                                        src={getImageUrl(image)}
                                        alt={`product-${idx}`}
                                        style={{
                                            width: 200,
                                            height: 200,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                        }}
                                    />
                                    <ButtonDeleteFile
                                        filename={image}
                                        onDelete={() => handleDeleteImage(image)}
                                    />
                                </Stack>
                            ))}
                            <Stack alignItems="center" justifyContent={'center'} mt={2}>
                                <ButtonUploadWithOption
                                    onUpload={(img) => setProductImages((p) => [...p, img])}
                                />
                                <FormHelperText>Max 6 images recommended.</FormHelperText>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* === CATEGORY & SUBCATEGORY === */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors.productCategoryId}>
                                <InputLabel id="category-select-label">Kategori</InputLabel>
                                <Controller
                                    name="productCategoryId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            labelId="category-select-label"
                                            label="Kategori"
                                        >
                                            <MenuItem value="">Pilih kategori</MenuItem>
                                            {listCategory.map((c) => (
                                                <MenuItem key={c.categoryId} value={c.categoryId}>
                                                    {c.categoryName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                                <FormHelperText>{errors.productCategoryId?.message}</FormHelperText>
                            </FormControl>
                        </Grid>

                        {listSubCategory.length > 0 && (
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth error={!!errors.productSubCategoryId}>
                                    <InputLabel id="subcategory-select-label">
                                        Subkategori
                                    </InputLabel>
                                    <Controller
                                        name="productSubCategoryId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                labelId="subcategory-select-label"
                                                label="Subkategori"
                                            >
                                                <MenuItem value="">Pilih subkategori</MenuItem>
                                                {listSubCategory.map((sub) => (
                                                    <MenuItem
                                                        key={sub.categoryId}
                                                        value={sub.categoryId}
                                                    >
                                                        {sub.categoryName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <FormHelperText>
                                        {errors.productSubCategoryId?.message}
                                    </FormHelperText>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>

                    {/* === DESCRIPTION === */}
                    <Box sx={{ my: 4 }}>
                        <Typography fontWeight="bold" mb={2}>
                            Deskripsi
                        </Typography>
                        <Controller
                            name="productDescription"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Deskripsi"
                                    multiline
                                    fullWidth
                                    rows={4}
                                />
                            )}
                        />
                    </Box>

                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            type="submit"
                            sx={{ my: 1, width: '25ch', fontWeight: 'bold' }}
                            variant="contained"
                            disabled={loading}
                        >
                            {loading
                                ? productId
                                    ? 'Updating...'
                                    : 'Submitting...'
                                : productId
                                ? 'Update'
                                : 'Submit'}
                        </Button>
                    </Stack>
                </Box>
            </Card>
        </>
    );
}

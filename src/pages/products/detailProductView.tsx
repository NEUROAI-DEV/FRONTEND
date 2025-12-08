import { useParams } from 'react-router-dom';
import { useHttp } from '../../hooks/http';
import { useEffect, useState } from 'react';
import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { convertNumberToCurrency } from '../../utilities/convertNumberToCurrency';
import { getImageUrl } from '../../utilities/getImageUrl';
import { IProduct } from '../../interfaces/Product';

export default function DetailProductView() {
    const { handleGetRequest } = useHttp();
    const { productId } = useParams();
    const [productImages, setProductImages] = useState<string[]>([]);
    const [productDetail, setProductDetail] = useState<IProduct>();

    const getDetailProduct = async () => {
        const result: IProduct = await handleGetRequest({
            path: '/products/detail/' + productId,
        });
        if (result) {
            const images = Array.isArray(result?.productImages) ? result?.productImages : [];
            setProductImages(images);
            setProductDetail(result);
        }
    };

    useEffect(() => {
        getDetailProduct();
    }, []);

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
                        label: 'Detail',
                        link: '/products/detail/' + productId,
                    },
                ]}
            />
            <Card sx={{ p: 5 }}>
                <Box>
                    <Carousel dynamicHeight>
                        {productImages.map((image, index) => (
                            <div key={index}>
                                <img
                                    src={getImageUrl(image)}
                                    style={{
                                        maxHeight: '400px',
                                    }}
                                />
                            </div>
                        ))}
                    </Carousel>
                </Box>
                <Grid container spacing={5} p={2}>
                    <table>
                        <thead>
                            <th></th>
                            <th></th>
                            <th></th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Nama</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Typography>{productDetail?.productName}</Typography>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Harga</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Typography>
                                        Rp{convertNumberToCurrency(productDetail?.productPrice)}
                                    </Typography>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Deskripsi</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Typography>{productDetail?.productDescription}</Typography>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Kategori</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Stack direction={'row'} spacing={1}>
                                        {productDetail?.category && (
                                            <Chip
                                                label={productDetail?.category?.categoryName}
                                                sx={{ mx: 0.2 }}
                                            />
                                        )}
                                    </Stack>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Sub Kategori</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Stack direction={'row'} spacing={1}>
                                        {productDetail?.category && (
                                            <Chip
                                                label={productDetail?.category?.categoryName}
                                                sx={{ mx: 0.2 }}
                                            />
                                        )}
                                    </Stack>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Stok</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Typography>{productDetail?.productStock}</Typography>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Terjual</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Typography>{productDetail?.productTotalSale}</Typography>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <Typography fontWeight={'Bold'}>Berat</Typography>
                                </td>
                                <td>:</td>
                                <td>
                                    <Typography>{productDetail?.productWeight} gram</Typography>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Grid>
            </Card>
        </>
    );
}

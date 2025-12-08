/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useHttp } from '../../hooks/http';
import { useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { IOrdersModel } from '../../models/ordersModel';
import { convertNumberToCurrency } from '../../utilities/convertNumberToCurrency';
import { Carousel } from 'react-responsive-carousel';
import BreadCrumberStyle from '../../components/breadcrumb/Index';
import { IconMenus } from '../../components/icon';
import { getImageUrl } from '../../utilities/getImageUrl';

export default function DetailOrderView() {
    const { handleGetRequest } = useHttp();
    const { transactionId } = useParams();

    const [detailOrder, setDetailOrder] = useState<IOrdersModel>();
    const [orderStatus, setOrderStatus] = useState('');
    const [productImages, setProductImages] = useState<string[]>([]);

    const getDetailUser = async () => {
        const result: IOrdersModel = await handleGetRequest({
            path: '/orders/detail/' + transactionId,
        });
        if (result) {
            const images = result?.product?.productImages;
            setProductImages(images);
            setDetailOrder(result);
            setOrderStatus(result.orderStatus);
        }
    };

    useEffect(() => {
        getDetailUser();
    }, []);

    return (
        <>
            <BreadCrumberStyle
                navigation={[
                    {
                        label: 'Riwayat Transaction',
                        link: '/transactions',
                        icon: <IconMenus.transaction fontSize="small" />,
                    },
                    {
                        label: 'Detail',
                        link: '/transactions/detail/' + transactionId,
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

                <table>
                    <thead>
                        <th></th>
                        <th></th>
                        <th></th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Pembeli</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>{detailOrder?.user?.userName}</Typography>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>NO WA</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>{detailOrder?.user?.userWhatsAppNumber}</Typography>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Produk</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>{detailOrder?.product?.productName}</Typography>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Deskripsi</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>{detailOrder?.product?.productDescription}</Typography>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Total Order</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>{detailOrder?.orderTotalItem} Item</Typography>
                            </td>
                        </tr>
                        {/* <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Ongkir</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>
                                    Rp
                                    {convertNumberToCurrency(detailOrder?.orderOngkirPrice ?? 0)}
                                </Typography>
                            </td>
                        </tr> */}
                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Total Harga</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>
                                    Rp
                                    {convertNumberToCurrency(
                                        detailOrder?.orderTotalProductPrice! *
                                            detailOrder?.orderTotalItem!
                                    )}
                                </Typography>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Typography fontWeight={'Bold'}>Status</Typography>
                            </td>
                            <td>:</td>
                            <td>
                                <Typography>{orderStatus}</Typography>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Card>
        </>
    );
}

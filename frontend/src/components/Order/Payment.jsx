
import { Col, Divider, Form, Radio, Row, message, notification } from 'antd';
import { DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { doDeleteItemCartAction, doPlaceOrderAction, doUpdateCartAction } from '../../redux/order/orderSlice';
import { Input } from 'antd';
import { callPlaceOrder } from '../../services/api';
const { TextArea } = Input;

const Payment = (props) => {
    const carts = useSelector(state => state.order.carts);
    const [totalPrice, setTotalPrice] = useState(0);
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);
    const user = useSelector(state => state.account.user);
    const [form] = Form.useForm();


    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.map(item => {
                sum += item.quantity * item.detail.price;
            })
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts]);


    const handlePlaceOrder = () => {
        if (!address) {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: "Thông tin địa chỉ không được để trống!"
            })
            return;
        }
        props.setCurrentStep(2);
    }

    const onFinish = async (values) => {
        setIsSubmit(true);
        const detailOrder = carts.map(item => {
            return {
                bookName: item.detail.mainText,
                quantity: item.quantity,
                _id: item._id
            }
        })
        const data = {
            name: values.name,
            address: values.address,
            phone: values.phone,
            totalPrice: totalPrice,
            detail: detailOrder
        }

        const res = await callPlaceOrder(data);
        if (res && res.data) {
            message.success('Đặt hàng thành công !');
            dispatch(doPlaceOrderAction());
            props.setCurrentStep(2);
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            })
        }
        setIsSubmit(false);
    }

    return (
        <Row gutter={[20, 20]}>
            <Col md={16} xs={24}>
                {carts?.map((book, index) => {
                    const currentBookPrice = book?.detail?.price ?? 0;
                    return (
                        <div className='order-book' key={`index-${index}`}>
                            <div className='book-content'>
                                <img src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book?.detail?.thumbnail}`} />
                                <div className='title'>
                                    {book?.detail?.mainText}
                                </div>
                                <div className='price'>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBookPrice)}
                                </div>
                            </div>
                            <div className='action'>
                                <div className='quantity'>
                                    Số lượng: {book?.quantity}
                                </div>
                                <div className='sum'>
                                    Tổng:  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBookPrice * (book?.quantity ?? 0))}
                                </div>
                                <DeleteTwoTone
                                    style={{ cursor: "pointer" }}
                                    onClick={() => dispatch(doDeleteItemCartAction({ _id: book._id }))}
                                    twoToneColor="#eb2f96"
                                />

                            </div>
                        </div>
                    )
                })}
            </Col>
            <Col md={8} xs={24} >
                <div className='order-sum'>
                    <Form
                        onFinish={onFinish}
                        form={form}
                    >
                        <Form.Item
                            style={{ margin: 0 }}
                            labelCol={{ span: 24 }}
                            label="Tên người nhận"
                            name="name"
                            initialValue={user?.fullName}
                            rules={[{ required: true, message: 'Tên người nhận không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            style={{ margin: 0 }}
                            labelCol={{ span: 24 }}
                            label="Số điện thoại"
                            name="phone"
                            initialValue={user?.phone}
                            rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            style={{ margin: 0 }}
                            labelCol={{ span: 24 }}
                            label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                        >
                            <TextArea
                                autoFocus
                                rows={4}
                            />
                        </Form.Item>
                    </Form>
                    <div className='info'>
                        <div className='method'>
                            <div>  Hình thức thanh toán</div>
                            <Radio checked>Thanh toán khi nhận hàng</Radio>
                        </div>
                    </div>

                    <Divider style={{ margin: "5px 0" }} />
                    <div className='calculate'>
                        <span> Tổng tiền</span>
                        <span className='sum-final'>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                        </span>
                    </div>
                    <Divider style={{ margin: "5px 0" }} />
                    <button
                        onClick={() => form.submit()}
                        disabled={isSubmit}
                    >
                        {isSubmit && <span><LoadingOutlined /> &nbsp;</span>}
                        Đặt Hàng ({carts?.length ?? 0})
                    </button>
                </div>
            </Col>
        </Row>
    )
}

export default Payment;
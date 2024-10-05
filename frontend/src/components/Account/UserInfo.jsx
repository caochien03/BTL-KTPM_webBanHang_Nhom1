import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Form, Input, Row, Upload, message, notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { callUpdateAvatar, callUpdateUserInfo } from "../../services/api";
import { doUpdateUserInfoAction, doUploadAvatarAction } from "../../redux/account/accountSlice";
import { useState } from "react";

const UserInfo = (props) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const user = useSelector(state => state.account.user);
    const tempAvatar = useSelector(state => state.account.tempAvatar);

    const [userAvatar, setUserAvatar] = useState(user?.avatar ?? "");
    const [isSubmit, setIsSubmit] = useState(false);

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${tempAvatar || user?.avatar}`;

    const handleUploadAvatar = async ({ file, onSuccess, onError }) => {
        const res = await callUpdateAvatar(file);
        if (res && res.data) {
            const newAvatar = res.data.fileUploaded;
            dispatch(doUploadAvatarAction({ avatar: newAvatar }))
            setUserAvatar(newAvatar);
            onSuccess('ok')
        } else {
            onError('Đã có lỗi khi upload file');
        }
    };

    const propsUpload = {
        maxCount: 1,
        multiple: false,
        showUploadList: false,
        customRequest: handleUploadAvatar,
        onChange(info) {
            if (info.file.status !== 'uploading') {
            }
            if (info.file.status === 'done') {
                message.success(`Upload file thành công`);
            } else if (info.file.status === 'error') {
                message.error(`Upload file thất bại`);
            }
        },
    };

    const onFinish = async (values) => {
        const { fullName, phone, _id } = values;
        setIsSubmit(true)
        const res = await callUpdateUserInfo(_id, phone, fullName, userAvatar);

        if (res && res.data) {
            //update redux
            dispatch(doUpdateUserInfoAction({ avatar: userAvatar, phone, fullName }));
            message.success("Cập nhật thông tin user thành công");

            //force renew token
            localStorage.removeItem('access_token');
        } else {
            notification.error({
                message: "Đã có lỗi xảy ra",
                description: res.message
            })
        }
        setIsSubmit(false)
    }

    return (
        <div style={{ minHeight: 400 }}>
            <Row>
                <Col sm={24} md={12}>
                    <Row gutter={[30, 30]}>
                        <Col span={24}>
                            <Avatar
                                size={{ xs: 32, sm: 64, md: 80, lg: 128, xl: 160, xxl: 200 }}
                                icon={<AntDesignOutlined />}
                                src={urlAvatar}
                                shape="circle"
                            />
                        </Col>
                        <Col span={24}>
                            <Upload {...propsUpload}>
                                <Button icon={<UploadOutlined />}>
                                    Upload Avatar
                                </Button>
                            </Upload>
                        </Col>
                    </Row>
                </Col>
                <Col sm={24} md={12}>
                    <Form
                        onFinish={onFinish}
                        form={form}
                    >
                        <Form.Item
                            hidden
                            labelCol={{ span: 24 }}
                            label="Email"
                            name="_id"
                            initialValue={user?.id}

                        >
                            <Input disabled hidden />
                        </Form.Item>

                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Email"
                            name="email"
                            initialValue={user?.email}

                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Tên hiển thị"
                            name="fullName"
                            initialValue={user?.fullName}
                            rules={[{ required: true, message: 'Tên hiển thị không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label="Số điện thoại"
                            name="phone"
                            initialValue={user?.phone}
                            rules={[{ required: true, message: 'Số điện thoại không được để trống!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Button loading={isSubmit} onClick={() => form.submit()}>Cập nhật</Button>
                    </Form>
                </Col>
            </Row>
        </div>
    )
}

export default UserInfo;
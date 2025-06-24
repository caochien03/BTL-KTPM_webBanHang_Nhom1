import { Badge, Descriptions, Divider, Space, Table, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import { callOrderHistory } from "../../services/api";
import { FORMAT_DATE_DISPLAY } from "../../utils/constant";
import ReactJson from 'react-json-view'

const History = () => {
    const [orderHistory, setOrderHistory] = useState([]);
    useEffect(() => {
        const fetchHistory = async () => {
            const res = await callOrderHistory();
            console.log('History response:', res);
            if (res && res.success && res.data) {
                setOrderHistory(res.data);
            }
        }
        fetchHistory();
    }, []);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (item, record, index) => (<>{index + 1}</>)
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
        },
        {
            title: 'Thời gian ',
            dataIndex: 'createdAt',
            render: (item, record, index) => {
                return moment(item).format(FORMAT_DATE_DISPLAY)
            }
        },
        {
            title: 'Tổng số tiền',
            dataIndex: 'totalAmount',
            render: (item, record, index) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item)
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            render: (status) => {
                const statusConfig = {
                    'pending': { color: 'orange', text: 'Chờ xử lý' },
                    'confirmed': { color: 'blue', text: 'Đã xác nhận' },
                    'processing': { color: 'purple', text: 'Đang xử lý' },
                    'shipped': { color: 'cyan', text: 'Đang giao' },
                    'delivered': { color: 'green', text: 'Đã giao' },
                    'cancelled': { color: 'red', text: 'Đã hủy' }
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return (
                    <Tag color={config.color}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <ReactJson
                    src={record.items}
                    name={"Chi tiết đơn hàng"}
                    collapsed={true}
                    enableClipboard={false}
                    displayDataTypes={false}
                    displayObjectSize={false}
                />
            ),
        },
    ];


    return (
        <div >
            <div style={{ margin: "15px 0" }}>Lịch sử đặt hàng:</div>
            <Table 
                columns={columns} 
                dataSource={orderHistory} 
                pagination={false} 
                rowKey="_id"
            />
        </div>
    )
}

export default History;
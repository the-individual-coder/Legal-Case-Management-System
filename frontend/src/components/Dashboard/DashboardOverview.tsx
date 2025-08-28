'use client';

import { Card, Col, Row, Statistic, List, Avatar } from 'antd';
import { FileDoneOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';

const DashboardOverview = () => {
  return (
    <div className="space-y-12">
      {/* Summary Stats */}
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={<span className="font-serif text-lg text-neutral-700">Active Cases</span>}
              value={42}
              valueStyle={{ fontWeight: 'bold', fontSize: '2rem' }}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={<span className="font-serif text-lg text-neutral-700">Appointments Today</span>}
              value={7}
              valueStyle={{ fontWeight: 'bold', fontSize: '2rem' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={<span className="font-serif text-lg text-neutral-700">Pending Invoices</span>}
              value={15}
              valueStyle={{ fontWeight: 'bold', fontSize: '2rem' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Feed */}
      <Card
        bordered={false}
        title={
          <span className="font-serif text-xl text-neutral-800">
            Recent Activity
          </span>
        }
        className="shadow-sm"
      >
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: 'New case filed for John Doe',
              description: 'Filed by Attorney Smith - Aug 27, 2025',
            },
            {
              title: 'Invoice sent to Jane Roe',
              description: 'Awaiting payment - Aug 26, 2025',
            },
            {
              title: 'Hearing scheduled for Mike Ross',
              description: 'Courtroom 3A - Sep 01, 2025',
            },
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#000000' }} />}
                title={<span className="text-base font-medium">{item.title}</span>}
                description={<span className="text-sm text-neutral-500">{item.description}</span>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default DashboardOverview;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button, Card, Descriptions, Drawer, Grid, Table } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type React from 'react';

const { useBreakpoint } = Grid;

interface Props<T> extends TableProps<T> {
  mobilePrimaryFields?: string[];
}

export default function ResponsiveTable<T extends object>(props: Props<T>) {
  const { columns = [], dataSource, rowKey = 'id', mobilePrimaryFields, ...rest } = props;
  const screens = useBreakpoint();
  const [detail, setDetail] = useState<{ record: T; idx: number } | null>(null);

  if (screens.md !== false) {
    return <Table columns={columns} dataSource={dataSource} rowKey={rowKey} {...rest} />;
  }

  const getKey = (record: T, index: number): React.Key => {
    if (typeof rowKey === 'function') return (rowKey as any)(record, index);
    return ((record as any)[rowKey as string]) ?? index;
  };

  const flatCols = (columns as any[]).filter((c) => !c.children);
  const dataCols = flatCols.filter((c) => c.title);
  const actionCol = flatCols.find((c) => !c.title);

  const primaryCols =
    mobilePrimaryFields && mobilePrimaryFields.length > 0
      ? dataCols.filter((c: any) => mobilePrimaryFields.includes(c.dataIndex))
      : dataCols;

  const effectivePrimary = primaryCols.length > 0 ? primaryCols : dataCols;
  const showDetailBtn = effectivePrimary.length < dataCols.length;

  const cellValue = (col: any, record: T, idx: number) => {
    const raw = col.dataIndex ? (record as any)[col.dataIndex] : undefined;
    return col.render ? col.render(raw, record, idx) : (raw != null ? String(raw) : '-');
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(dataSource ?? []).map((record, idx) => (
          <Card key={getKey(record, idx)} size="small" styles={{ body: { padding: '8px 12px' } }}>
            {effectivePrimary.map((col: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: i < effectivePrimary.length - 1 ? '1px solid #f5f5f5' : 'none',
                  gap: 8,
                  minHeight: 28,
                }}
              >
                <span style={{ color: '#8c8c8c', fontSize: 12, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {col.title}
                </span>
                <span style={{ fontSize: 13, textAlign: 'right' }}>
                  {cellValue(col, record, idx)}
                </span>
              </div>
            ))}
            <div
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {showDetailBtn ? (
                <Button
                  size="small"
                  type="link"
                  icon={<EyeOutlined />}
                  style={{ paddingLeft: 0 }}
                  onClick={() => setDetail({ record, idx })}
                >
                  ລາຍລະອຽດ
                </Button>
              ) : (
                <span />
              )}
              {actionCol?.render && (
                <div>{actionCol.render(undefined, record, idx)}</div>
              )}
            </div>
          </Card>
        ))}
        {(!dataSource || dataSource.length === 0) && (
          <div style={{ padding: '32px 0', textAlign: 'center', color: '#bfbfbf', fontSize: 14 }}>
            ບໍ່ມີຂໍ້ມູນ
          </div>
        )}
      </div>

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        placement="bottom"
        title="ລາຍລະອຽດ"
        styles={{
          section: { borderRadius: '16px 16px 0 0' },
          wrapper: { height: '80dvh' },
        }}
      >
        {detail && (
          <>
            <Descriptions
              column={1}
              size="small"
              bordered
              styles={{ label: { color: '#8c8c8c', width: 120, whiteSpace: 'nowrap' } }}
            >
              {dataCols.map((col: any, i: number) => (
                <Descriptions.Item key={i} label={col.title}>
                  {cellValue(col, detail.record, detail.idx)}
                </Descriptions.Item>
              ))}
            </Descriptions>
            {actionCol?.render && (
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                {actionCol.render(undefined, detail.record, detail.idx)}
              </div>
            )}
          </>
        )}
      </Drawer>
    </>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { 
  Button, 
  Space, 
  Input, 
  InputNumber, 
  Select, 
  Card, 
  Row, 
  Col, 
  Divider, 
  Typography, 
  Form, 
  Switch,
  ColorPicker,
  message,
  Modal,
  Table as AntTable,
  Tag
} from 'antd';
import Lubanno7UniverSheet from 'lubanno7-univer-sheet';
import 'lubanno7-univer-sheet/lib/lubanno7-univer-sheet.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

function App() {
  const containerRef = useRef(null);
  const sheetInstanceRef = useRef(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [exposedMethods, setExposedMethods] = useState({});
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 初始列配置
  const initialColumns = [
    {
      label: '基本信息',
      children: [
        { 
          label: 'ID', 
          prop: 'id',
          width: 80,
          editor: { type: 'readonly' }
        },
        { 
          label: '姓名', 
          prop: 'name',
          width: 120
        },
        { 
          label: '年龄', 
          prop: 'age',
          width: 80
        }
      ]
    },
    {
      label: '详细信息',
      children: [
        { 
          label: '部门', 
          prop: 'department',
          width: 120,
          editor: {
            type: 'select',
            options: ['技术部', '销售部', '市场部', '人事部'],
            allowInput: true
          }
        },
        { 
          label: '状态', 
          prop: 'status',
          width: 100,
          editor: {
            type: 'select',
            options: ['在职', '离职', '休假'],
            allowInput: false
          }
        },
        { 
          label: '是否激活', 
          prop: 'active',
          width: 100,
          editor: {
            type: 'checkbox',
            checkedValue: 1,
            uncheckedValue: 0
          }
        }
      ]
    },
    { 
      label: '备注', 
      prop: 'remark',
      width: 200
    }
  ];

  // 初始数据
  const initialData = [
    { id: 1, name: '张三', age: 25, department: '技术部', status: '在职', active: 1, remark: '优秀员工' },
    { id: 2, name: '李四', age: 30, department: '销售部', status: '在职', active: 1, remark: '销售冠军' },
    { id: 3, name: '王五', age: 28, department: '市场部', status: '休假', active: 0, remark: '市场专家' },
    { id: 4, name: '赵六', age: 35, department: '人事部', status: '在职', active: 1, remark: 'HR主管' },
    { id: 5, name: '钱七', age: 26, department: '技术部', status: '离职', active: 0, remark: '前端工程师' }
  ];

  // 初始配置
  const initialConfig = {
    locale: 'zh-CN',
    theme: 'defaultTheme',
    darkMode: false,
    headerOptions: {
      show: true,
      showToolbar: true,
      ribbonType: 'default'
    },
    footerOptions: {
      show: true,
      showStatisticBar: false,
      showZoomSlider: true
    },
    showContextMenu: true,
    styleOptions: {
      width: '100%',
      height: '400px'
    },
    commonStyle: {
      defaultRowHeight: 25,
      defaultColumnWidth: 100,
      backgroundColor: '#ffffff',
      borderColor: '#d9d9d9',
      borderType: 'all',
      borderStyleType: 'thin',
      horizontalAlign: 'left',
      verticalAlign: 'middle',
      fontSize: 12,
      color: '#000000'
    },
    headerStyle: {
      backgroundColor: '#f5f5f5',
      color: '#000000',
      fontWeight: 'bold'
    },
    readonlyCellStyle: {
      backgroundColor: '#f0f0f0',
      color: '#666666'
    },
    permissionOptions: {
      allowInsertRow: true,
      allowDeleteRow: true
    },
    plugins: {
      filter: { enabled: true },
      sort: { enabled: true },
      findReplace: { enabled: true }
    }
  };

  const [currentConfig, setCurrentConfig] = useState(initialConfig);

  // 添加事件日志
  const addEventLog = (eventName, data) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now(),
      timestamp,
      eventName,
      data: JSON.stringify(data, null, 2)
    };
    setEventLogs(prev => [logEntry, ...prev.slice(0, 49)]); // 保留最新50条
    console.log(`[${timestamp}] ${eventName}:`, data);
  };

  // 初始化表格
  const initializeSheet = (config = currentConfig) => {
    // 确保彻底清理旧的表格实例
    if (sheetInstanceRef.current) {
      sheetInstanceRef.current.dispose();
      sheetInstanceRef.current = null;
    }

    // 清空容器内容，确保没有残留的DOM元素
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const sheet = new Lubanno7UniverSheet(containerRef.current, {
        columns: initialColumns,
        data: initialData,
        config
      });

      // 监听所有事件
      sheet.on('tableInitialized', (data) => {
        addEventLog('tableInitialized', data || {});
        const exposed = sheet.getExposed();
        setExposedMethods(exposed.methods);
        // 同步表格数据
        if (exposed.methods.getTableData) {
          setTableData(exposed.methods.getTableData());
        }
      });

      sheet.on('updateData', (data) => {
        addEventLog('updateData', data);
        setTableData(data.currentTableData);
      });

      sheet.on('insertRow', (data) => {
        addEventLog('insertRow', data);
        setTableData(data.currentTableData);
      });

      sheet.on('deleteRow', (data) => {
        addEventLog('deleteRow', data);
        setTableData(data.currentTableData);
      });

      sheet.on('rowInserted', (data) => {
        addEventLog('rowInserted', data);
        setTableData(data.currentTableData);
      });

      sheet.on('rowUpdated', (data) => {
        addEventLog('rowUpdated', data);
        setTableData(data.currentTableData);
      });

      sheet.on('cellClick', (data) => {
        addEventLog('cellClick', data);
      });

      sheet.on('forbiddenAction', (data) => {
        addEventLog('forbiddenAction', data);
        message.warning(`禁止操作: ${data.type}`);
      });

      sheetInstanceRef.current = sheet;
    }
  };

  useEffect(() => {
    initializeSheet();
    return () => {
      if (sheetInstanceRef.current) {
        sheetInstanceRef.current.dispose();
        sheetInstanceRef.current = null;
      }
    };
  }, []);

  // 测试方法
  const testMethods = {
    getTableData: () => {
      if (exposedMethods.getTableData) {
        const data = exposedMethods.getTableData();
        addEventLog('getTableData', { result: data });
        setTableData(data);
        message.success(`获取到 ${data.length} 行数据`);
      }
    },

    getTableHeaderRowCount: () => {
      if (exposedMethods.getTableHeaderRowCount) {
        const count = exposedMethods.getTableHeaderRowCount();
        addEventLog('getTableHeaderRowCount', { result: count });
        message.info(`表头行数: ${count}`);
      }
    },

    getTableDataRowCount: () => {
      if (exposedMethods.getTableDataRowCount) {
        const count = exposedMethods.getTableDataRowCount();
        addEventLog('getTableDataRowCount', { result: count });
        message.info(`数据行数: ${count}`);
      }
    },

    getTableRowCount: () => {
      if (exposedMethods.getTableRowCount) {
        const count = exposedMethods.getTableRowCount();
        addEventLog('getTableRowCount', { result: count });
        message.info(`总行数: ${count}`);
      }
    },

    getTableColumnCount: () => {
      if (exposedMethods.getTableColumnCount) {
        const count = exposedMethods.getTableColumnCount();
        addEventLog('getTableColumnCount', { result: count });
        message.info(`总列数: ${count}`);
      }
    },

    insertRowBefore: () => {
      const index = parseInt(prompt('请输入要在哪一行前插入 (从0开始):', '0'));
      if (!isNaN(index) && exposedMethods.insertRowBefore) {
        const newRow = {
          id: Date.now(),
          name: '新员工',
          age: 25,
          department: '技术部',
          status: '在职',
          active: 1,
          remark: '新插入的行'
        };
        exposedMethods.insertRowBefore(index, newRow);
        addEventLog('insertRowBefore', { index, newRow });
        message.success(`在第 ${index} 行前插入成功`);
      }
    },

    insertRowAfter: () => {
      const index = parseInt(prompt('请输入要在哪一行后插入 (从0开始):', '0'));
      if (!isNaN(index) && exposedMethods.insertRowAfter) {
        const newRow = {
          id: Date.now(),
          name: '新员工',
          age: 25,
          department: '销售部',
          status: '在职',
          active: 1,
          remark: '新插入的行'
        };
        exposedMethods.insertRowAfter(index, newRow);
        addEventLog('insertRowAfter', { index, newRow });
        message.success(`在第 ${index} 行后插入成功`);
      }
    },

    insertRowToEnd: () => {
      if (exposedMethods.insertRowToEnd) {
        const newRow = {
          id: Date.now(),
          name: '末尾员工',
          age: 30,
          department: '市场部',
          status: '在职',
          active: 1,
          remark: '插入到末尾的行'
        };
        exposedMethods.insertRowToEnd(newRow);
        addEventLog('insertRowToEnd', { newRow });
        message.success('在末尾插入成功');
      }
    },

    updateRow: () => {
      const index = parseInt(prompt('请输入要更新的行索引 (从0开始):', '0'));
      if (!isNaN(index) && exposedMethods.updateRow) {
        const updateData = {
          name: '更新后的姓名',
          age: 99,
          remark: '已更新'
        };
        exposedMethods.updateRow(index, updateData, true);
        addEventLog('updateRow', { index, updateData });
        message.success(`第 ${index} 行更新成功`);
      }
    },

    deleteRow: () => {
      const index = parseInt(prompt('请输入要删除的行索引 (从0开始):', '0'));
      if (!isNaN(index) && exposedMethods.deleteRow) {
        exposedMethods.deleteRow(index);
        addEventLog('deleteRow', { index });
        message.success(`第 ${index} 行删除成功`);
      }
    },

    getRowByIndex: () => {
      const index = parseInt(prompt('请输入行索引 (从0开始):', '0'));
      if (!isNaN(index) && exposedMethods.getRowByIndex) {
        const row = exposedMethods.getRowByIndex(index);
        addEventLog('getRowByIndex', { index, result: row });
        if (row) {
          message.success(`获取第 ${index} 行数据成功`);
        } else {
          message.error(`第 ${index} 行不存在`);
        }
      }
    },

    getRowByFilter: () => {
      const filterStr = prompt('请输入筛选条件 (JSON格式):', '{"status": "在职"}');
      try {
        const filter = JSON.parse(filterStr);
        if (exposedMethods.getRowByFilter) {
          const row = exposedMethods.getRowByFilter(filter);
          addEventLog('getRowByFilter', { filter, result: row });
          if (row) {
            message.success('筛选到匹配的行');
          } else {
            message.info('没有找到匹配的行');
          }
        }
      } catch (e) {
        message.error('筛选条件格式错误');
      }
    },

    getRowByFilterAll: () => {
      const filterStr = prompt('请输入筛选条件 (JSON格式):', '{"status": "在职"}');
      try {
        const filter = JSON.parse(filterStr);
        if (exposedMethods.getRowByFilterAll) {
          const rows = exposedMethods.getRowByFilterAll(filter);
          addEventLog('getRowByFilterAll', { filter, result: rows });
          message.success(`筛选到 ${rows.length} 行数据`);
        }
      } catch (e) {
        message.error('筛选条件格式错误');
      }
    },

    getRowIndexByFilter: () => {
      const filterStr = prompt('请输入筛选条件 (JSON格式):', '{"name": "张三"}');
      try {
        const filter = JSON.parse(filterStr);
        if (exposedMethods.getRowIndexByFilter) {
          const index = exposedMethods.getRowIndexByFilter(filter);
          addEventLog('getRowIndexByFilter', { filter, result: index });
          if (index >= 0) {
            message.success(`找到匹配行的索引: ${index}`);
          } else {
            message.info('没有找到匹配的行');
          }
        }
      } catch (e) {
        message.error('筛选条件格式错误');
      }
    },

    getRowIndexByFilterAll: () => {
      const filterStr = prompt('请输入筛选条件 (JSON格式):', '{"active": 1}');
      try {
        const filter = JSON.parse(filterStr);
        if (exposedMethods.getRowIndexByFilterAll) {
          const indices = exposedMethods.getRowIndexByFilterAll(filter);
          addEventLog('getRowIndexByFilterAll', { filter, result: indices });
          message.success(`找到 ${indices.length} 个匹配行的索引`);
        }
      } catch (e) {
        message.error('筛选条件格式错误');
      }
    },

    setCellFontColor: () => {
      const rowIndex = parseInt(prompt('请输入行索引 (从0开始):', '0'));
      const columnName = prompt('请输入列名:', 'name');
      const color = prompt('请输入颜色 (如: #ff0000):', '#ff0000');
      
      if (!isNaN(rowIndex) && columnName && color && exposedMethods.setCellFontColor) {
        const success = exposedMethods.setCellFontColor(rowIndex, columnName, color);
        addEventLog('setCellFontColor', { rowIndex, columnName, color, success });
        if (success) {
          message.success('设置字体颜色成功');
        } else {
          message.error('设置字体颜色失败');
        }
      }
    },

    getColumnName: () => {
      const colIndex = parseInt(prompt('请输入列索引 (从0开始):', '0'));
      if (!isNaN(colIndex) && exposedMethods.getColumnName) {
        const name = exposedMethods.getColumnName(colIndex);
        addEventLog('getColumnName', { colIndex, result: name });
        message.info(`第 ${colIndex} 列的名称: ${name}`);
      }
    },

    getColumnIndex: () => {
      const columnName = prompt('请输入列名:', 'name');
      if (columnName && exposedMethods.getColumnIndex) {
        const index = exposedMethods.getColumnIndex(columnName);
        addEventLog('getColumnIndex', { columnName, result: index });
        if (index >= 0) {
          message.info(`列 ${columnName} 的索引: ${index}`);
        } else {
          message.error(`列 ${columnName} 不存在`);
        }
      }
    },

    endEditing: () => {
      if (exposedMethods.endEditing) {
        exposedMethods.endEditing();
        addEventLog('endEditing', {});
        message.success('结束编辑状态');
      }
    },

    exportToJson: () => {
      const filename = prompt('请输入文件名:', 'table_data.json');
      if (filename && exposedMethods.exportToJson) {
        const success = exposedMethods.exportToJson(filename);
        addEventLog('exportToJson', { filename, success });
        if (success) {
          message.success('导出JSON成功');
        } else {
          message.error('导出JSON失败');
        }
      }
    },

    exportToCsv: () => {
      const filename = prompt('请输入文件名:', 'table_data.csv');
      if (filename && exposedMethods.exportToCsv) {
        const success = exposedMethods.exportToCsv(filename);
        addEventLog('exportToCsv', { filename, success });
        if (success) {
          message.success('导出CSV成功');
        } else {
          message.error('导出CSV失败');
        }
      }
    },

    dispose: () => {
      if (exposedMethods.dispose) {
        exposedMethods.dispose();
        addEventLog('dispose', {});
        message.success('销毁表格实例');
        setExposedMethods({});
        setTableData([]);
        // 确保清除表格实例引用
        sheetInstanceRef.current = null;
      }
    }
  };

  // 配置表单提交
  const handleConfigSubmit = (values) => {
    const newConfig = {
      ...currentConfig,
      ...values,
      styleOptions: {
        ...currentConfig.styleOptions,
        ...values.styleOptions
      },
      commonStyle: {
        ...currentConfig.commonStyle,
        ...values.commonStyle
      },
      headerStyle: {
        ...currentConfig.headerStyle,
        ...values.headerStyle
      }
    };
    
    setCurrentConfig(newConfig);
    setConfigModalVisible(false);
    
    // 重新初始化表格
    initializeSheet(newConfig);
    message.success('配置已更新，表格已重建');
  };

  // 事件日志表格列
  const logColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      width: 100,
    },
    {
      title: '事件名称',
      dataIndex: 'eventName',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '数据',
      dataIndex: 'data',
      render: (text) => (
        <pre style={{ 
          maxHeight: '100px', 
          overflow: 'auto', 
          fontSize: '12px',
          margin: 0,
          whiteSpace: 'pre-wrap'
        }}>
          {text}
        </pre>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Lubanno7UniverSheet 组件demo</Title>
      
      {/* 表格容器 */}
      <Card title="表格显示区域" style={{ marginBottom: '20px' }}>
        <div ref={containerRef} style={{ border: '1px solid #d9d9d9' }} />
      </Card>

      {/* 控制面板 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="基础操作" size="small">
            <Space wrap>
              <Button onClick={() => initializeSheet()}>重新初始化</Button>
              <Button onClick={() => setConfigModalVisible(true)}>配置表格</Button>
              <Button onClick={testMethods.getTableData}>获取表格数据</Button>
              <Button onClick={testMethods.endEditing}>结束编辑</Button>
            </Space>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="表格信息" size="small">
            <Space wrap>
              <Button onClick={testMethods.getTableHeaderRowCount}>表头行数</Button>
              <Button onClick={testMethods.getTableDataRowCount}>数据行数</Button>
              <Button onClick={testMethods.getTableRowCount}>总行数</Button>
              <Button onClick={testMethods.getTableColumnCount}>总列数</Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="行操作" size="small">
            <Space wrap>
              <Button type="primary" onClick={testMethods.insertRowBefore}>前插入行</Button>
              <Button type="primary" onClick={testMethods.insertRowAfter}>后插入行</Button>
              <Button type="primary" onClick={testMethods.insertRowToEnd}>末尾插入</Button>
              <Button onClick={testMethods.updateRow}>更新行</Button>
              <Button danger onClick={testMethods.deleteRow}>删除行</Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="查询操作" size="small">
            <Space wrap>
              <Button onClick={testMethods.getRowByIndex}>按索引查询</Button>
              <Button onClick={testMethods.getRowByFilter}>筛选单行</Button>
              <Button onClick={testMethods.getRowByFilterAll}>筛选多行</Button>
              <Button onClick={testMethods.getRowIndexByFilter}>筛选索引</Button>
              <Button onClick={testMethods.getRowIndexByFilterAll}>筛选所有索引</Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="列操作" size="small">
            <Space wrap>
              <Button onClick={testMethods.getColumnName}>获取列名</Button>
              <Button onClick={testMethods.getColumnIndex}>获取列索引</Button>
              <Button onClick={testMethods.setCellFontColor}>设置字体颜色</Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="导出操作" size="small">
            <Space wrap>
              <Button onClick={testMethods.exportToJson}>导出JSON</Button>
              <Button onClick={testMethods.exportToCsv}>导出CSV</Button>
              <Button danger onClick={testMethods.dispose}>销毁实例</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 当前数据显示 */}
      <Card title={`当前表格数据 (${tableData.length} 行)`} style={{ marginTop: '20px' }}>
        <pre style={{ maxHeight: '200px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px' }}>
          {JSON.stringify(tableData, null, 2)}
        </pre>
      </Card>

      {/* 事件日志 */}
      <Card title={`事件日志 (${eventLogs.length} 条)`} style={{ marginTop: '20px' }}>
        <AntTable
          columns={logColumns}
          dataSource={eventLogs}
          rowKey="id"
          size="small"
          scroll={{ y: 300 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 配置弹窗 */}
      <Modal
        title="表格配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={currentConfig}
          onFinish={handleConfigSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="语言" name="locale">
                <Select>
                  <Select.Option value="zh-CN">中文</Select.Option>
                  <Select.Option value="en-US">English</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="主题" name="theme">
                <Select>
                  <Select.Option value="defaultTheme">默认主题</Select.Option>
                  <Select.Option value="greenTheme">绿色主题</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="暗色模式" name="darkMode" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="显示工具栏" name={['headerOptions', 'showToolbar']} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="显示右键菜单" name="showContextMenu" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider>样式配置</Divider>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="表格高度" name={['styleOptions', 'height']}>
                <Input placeholder="如: 400px" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="默认行高" name={['commonStyle', 'defaultRowHeight']}>
                <InputNumber min={15} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="默认列宽" name={['commonStyle', 'defaultColumnWidth']}>
                <InputNumber min={50} max={300} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="字体大小" name={['commonStyle', 'fontSize']}>
                <InputNumber min={10} max={20} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="背景颜色" name={['commonStyle', 'backgroundColor']}>
                <ColorPicker showText />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="边框颜色" name={['commonStyle', 'borderColor']}>
                <ColorPicker showText />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="边框类型" name={['commonStyle', 'borderType']}>
                <Select>
                  <Select.Option value="all">全边框</Select.Option>
                  <Select.Option value="horizontal">水平边框</Select.Option>
                  <Select.Option value="vertical">垂直边框</Select.Option>
                  <Select.Option value="none">无边框</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="水平对齐" name={['commonStyle', 'horizontalAlign']}>
                <Select>
                  <Select.Option value="left">左对齐</Select.Option>
                  <Select.Option value="center">居中</Select.Option>
                  <Select.Option value="right">右对齐</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="垂直对齐" name={['commonStyle', 'verticalAlign']}>
                <Select>
                  <Select.Option value="top">顶部</Select.Option>
                  <Select.Option value="middle">居中</Select.Option>
                  <Select.Option value="bottom">底部</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>权限配置</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="允许插入行" name={['permissionOptions', 'allowInsertRow']} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="允许删除行" name={['permissionOptions', 'allowDeleteRow']} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                应用配置并重建表格
              </Button>
              <Button onClick={() => setConfigModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
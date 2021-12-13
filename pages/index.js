import Head from 'next/head'
import Image from 'next/image'
//import styles from '../styles/Home.module.css'
import React, {Fragment, useCallback, useState} from 'react';
import { Table, Space, Divider, Button, Modal, Select, Form, Input} from 'antd';
import { UpCircleFilled, DownCircleFilled, SwapRightOutlined } from '@ant-design/icons';
import { Icon } from '@ant-design/compatible';
import CiscoIconSvg from '../public/app-cisco.svg';
import { Column } from 'rc-table';
import useSWR, {mutate} from 'swr';
import TextArea from 'rc-textarea';
import { modalGlobalConfig } from 'antd/lib/modal/confirm';

const eesvData = require('../dev/eesv-data.json');
const eeioData = require('../dev/eeio-data.json');
const apiData = require('../dev/api-version.json')
const serverData = require('../dev/server-data.json')

const serverColData = [
  {
    title: "Hostname",
    dataIndex: "hostname",
    key: "hostname",
  },
  {
    title: "Processes",
    dataIndex: "process_count",
    key: "process_count",
  },
  {
    title: "PCIE Devices",
    dataIndex: "device_count",
    key: "device_count",
  },
]

function itemRender(current, type, originalElement) {
  if (type === 'prev') {<a rel="nofollow">1</a>
    return originalElement;
  }
  if (type === 'next') {
    return originalElement;
//    return <a>Next</a>;
  }
  return originalElement;
//  return <a style={{color:'black', "borderColor":'black'}} rel="nofollow">1</a>;
}


export default function Home() {
  const systemURL = '/api/eem/api_version'
  const serversURL = '/api/eem/devices/detail/?status=eesv';
  const GPUURL = '/api/eem/devices/detail/?status=eeio';
  const deviceURL = '/api/eem/devices/';
  const processesURL = '/api/processes';
  const fetcher = async url => fetch(url, {method: 'GET', headers: {'Authorization': 'Basic YWRtaW46MTAtOSNPbmU=', 'Content-Type': 'application/json','Accept': 'application/json'}})
                            .then(response => {
                              if (response.ok) {
                                return response;
                              }
                              // convert non-2xx HTTP responses into errors:
                              const error = new Error(response.statusText);
                              error.response = response;
                              return Promise.reject(error);
                            })
                            .then(response => response.json())
                            .then(data => {
                              const result = [];
                              result.push(data);
                              console.log(result);
                              return result;
                            })
                            .then(data => {
                              console.log(JSON.stringify(data));
                              return data;
                            });
  const fetcherDevices = async url => fetch(url, {method: 'GET', headers: {'Authorization': 'Basic YWRtaW46MTAtOSNPbmU=', 'Content-Type': 'application/json','Accept': 'application/json'}})
                            .then(response => {
                              if (response.ok) {
                                return response;
                              }
                              // convert non-2xx HTTP responses into errors:
                              const error = new Error(response.statusText);
                              error.response = response;
                              return Promise.reject(error);
                            })
                            .then(response => response.json())
                            .then(data => {
                              console.log(data);
                              const result = [];
                              for (var i=0; i<data.devices.length; i++) {
                                data.devices[i].pcie_vendor_id = "NVIDIA Corporation";
                                if (data.devices[i].pcie_device_id == '0x1db6') {
                                  data.devices[i].pcie_device_id = 'GV100GL [Tesla V100 PCIe 32GB]';
                                } else {
                                  data.devices[i].pcie_device_id = 'GP100GL [Tesla P100 PCIe 16GB]';
                                }
                              }
                              result.push(data.devices);
//                              console.log(result);
                              return data.devices;
                            })
                            .then(data => {
//                              console.log(JSON.stringify(data));
//                              var response = fetch('/api/pcielookup')
//                              console.log(response.text());
                              return data;
                            });

  const fetcherProcesses = async url => fetch(url, {method: 'GET', headers: {'Authorization': 'Basic YWRtaW46MTAtOSNPbmU=', 'Content-Type': 'application/json','Accept': 'application/json'}})
                            .then(response => {
                              if (response.ok) {
                                return response;
                              }
                              // convert non-2xx HTTP responses into errors:
                              const error = new Error(response.statusText);
                              error.response = response;
                              return Promise.reject(error);
                            })
                            .then(response => response.json())
                            .then(data => {
                              const result = [];
                              result.push(data);
                              console.log(result);
                              return result;
                            })
                            .then(data => {
                              console.log(JSON.stringify(data));
                              return data;
                            });

  const { data : system, error : error1 } = useSWR(systemURL, fetcher);
  const { data : serverDevices, error : error2 } = useSWR(serversURL, fetcherDevices);
  const { data : gpuDevices, error : error3 } = useSWR(GPUURL, fetcherDevices);
  const { data : processes, error : error4 } = useSWR(processesURL, fetcherProcesses);

  const onChange = () => {};
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const showAboutModal = () => {
    setIsAboutModalVisible(true);
  };
  const handleAboutOk = () => {
    setIsAboutModalVisible(false);
  };
  const handleAboutCancel = () => {
    setIsAboutModalVisible(false);
  };
  const [isChangeIDModalVisible, setIsChangeIDModalVisible] = useState(false);
  const [confirmChangeIDLoading, setConfirmChangeIDLoading] = useState(false);
  const [changeIDModalTitle, setChangeIDModalTitle] = useState('Device ID');
  const [changeIDform] = Form.useForm();
  const handleChangeIDOk = useCallback((values) => {
    setConfirmChangeIDLoading(true)
    console.log(values);
    var url = deviceURL+values.device_id+'/group_id';
    console.log(url);
    var body = '{"group_id": "' + values.group_id + '"}';
    console.log(body);
    var response = fetch(deviceURL+values.device_id+'/group_id', {method: 'PUT', 
                        headers: {'Authorization': 'Basic YWRtaW46MTAtOSNPbmU=', 'Content-Type': 'application/json','Accept': 'application/json'},
                        body: '{"group_id": "'+values.group_id+'"}'})
                    .then(response => {
                        if (response.ok) {
                          return response;
                        }
                        // convert non-2xx HTTP responses into errors:
                        console.log(response.status+': '+response.statusText);
//                        const error = new Error(response.statusText);
//                        error.response = response;
//                        return Promise.reject(error);
                        return response;
                  })
                  .then(response => response.json())
                  .then(data => {
//                    console.log(JSON.stringify(data));
                    return data;
                  });
    mutate(systemURL);
    mutate(serversURL);
    mutate(GPUURL);
//    setTimeout(() => {
      setIsChangeIDModalVisible(false);
      setConfirmChangeIDLoading(false);
//    },2000);
  }, [changeIDform]);
const handleChangeIDCancel = () => {
    setConfirmChangeIDLoading(false)
    setIsChangeIDModalVisible(false);
  };
  const showChangeIDModal = (deviceId, deviceType, event) => {
    if (deviceType == 'Server') {
      setChangeIDModalTitle('Change Group ID for Server: ' + deviceId);
    } else {
      setChangeIDModalTitle('Change Group ID for Device: ' + deviceId);
    }
//    console.log('deviceid before: ');
//    console.log(changeIDform.getFieldsValue('device_id'));
    changeIDform.setFieldsValue({'device_id' : deviceId});
//    console.log('deviceid after: ');
//    console.log(changeIDform.getFieldsValue('device_id'))
    setConfirmChangeIDLoading(false)
    setIsChangeIDModalVisible(true);
  };


  const [isRemoveIDModalVisible, setIsRemoveIDModalVisible] = useState(false);
  const [confirmRemoveIDLoading, setConfirmRemoveIDLoading] = useState(false);
  const [RemoveIDModalTitle, setRemoveIDModalTitle] = useState('Device ID');
  const [removeIDform] = Form.useForm();
  const handleRemoveIDOk = useCallback((values) => {
    setConfirmRemoveIDLoading(true)
    console.log(values);
    var url = deviceURL+values.device_id+'/group_id';
    console.log(url);
//    var body = '{"group_id": "' + values.group_id + '"}';
//    console.log(body);
    var response = fetch(deviceURL+values.device_id+'/group_id', {method: 'DELETE', 
                        headers: {'Authorization': 'Basic YWRtaW46MTAtOSNPbmU=', 'Content-Type': 'application/json','Accept': 'application/json'}})
                    .then(response => {
                      console.log(response.status+': '+response.statusText);
                      if (response.ok) {
                          return response;
                        }
//                        const error = new Error(response.statusText);
//                        error.response = response;
//                        return Promise.reject(error);
                        return response;
                  })
                  .then(response => response.json())
                  .then(data => {
//                    console.log(JSON.stringify(data));
                    return data;
                  });
    mutate(systemURL);
    mutate(serversURL);
    mutate(GPUURL);
//    setTimeout(() => {
      setIsRemoveIDModalVisible(false);
      setConfirmRemoveIDLoading(false);
//    },2000);
  }, [removeIDform]);
const handleRemoveIDCancel = () => {
    setConfirmRemoveIDLoading(false)
    setIsRemoveIDModalVisible(false);
  };
  const showRemoveIDModal = (deviceId, deviceType, event) => {
    if (deviceType == 'Server') {
      setRemoveIDModalTitle('Remove Group ID for Server: ' + deviceId);
    } else {
      setRemoveIDModalTitle('Remove Group ID for Device: ' + deviceId);
    }
    removeIDform.setFieldsValue({'device_id' : deviceId});
    setConfirmRemoveIDLoading(false)
    setIsRemoveIDModalVisible(true);
  };




  const apiColData = [
    {
      title: "Status",
      dataIndex: "version_number",
      key: "version_number",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text !== "Unknown" || text !== "" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          <DownCircleFilled style={{"color":"red"}}/>
        )}
      </React.Fragment>
      )
    },
    {
      title: "API Version",
      dataIndex: "version_number",
      key: "version_number",
    },
  ]
  
  const eesvColData = [
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Power",
      dataIndex: "power_status",
      key: "power_status",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text === "on" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {text === "off" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
      )
    },
    {
      title: "Group ID",
      dataIndex: "group_id",
      key: "group_id",
      render: (text, record) => (
        <React.Fragment>
          <div>{text} (<a onClick={showChangeIDModal.bind(this, record.id, 'Server')} >Change</a>)</div>
        </React.Fragment>
      ),
    },
    {
      title: "Multi-MAC",
      dataIndex: "multi_mac_addresses",
      key: "multi_mac_addresses",
    },
    {
      title: "MAC",
      dataIndex: "mac_address",
      key: "mac_address",
    },
    {
      title: "VLAN Tagging",
      dataIndex: "vlan_tagging",
      key: "vlan_tagging",
    },
    {
      title: "Link 1",
      dataIndex: "link_status0",
      key: "link_status0",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text === "up" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {text === "down" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
      )
    },
    {
      title: "Link 2",
      dataIndex: "link_status1",
      key: "link_status1",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text === "up" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {text === "down" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
      )
    },
    {
      title: "Host Model",
      dataIndex: "host_model",
      key: "host_model",
      render: (text) => (
        <React.Fragment>
        {text === "" ? (
          "UCSC-C220-M5S"
        ) : (
          text
        )}
      </React.Fragment>
      )
    }
  ];

  const eeioColData = [
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Power",
      dataIndex: "power_status",
      key: "power_status",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text === "on" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {text === "off" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
      ),
    },
    {
      title: "Group ID",
      dataIndex: "group_id",
      key: "group_id",
      render: (text, record) => (
        <React.Fragment>
          {text === "4093" ? (
            <div>(<a onClick={showChangeIDModal.bind(this, record.id, 'Device')} >Change</a>)</div>
          ) : (
            <div>{text} (<a onClick={showChangeIDModal.bind(this, record.id, 'Device')} >Change</a>) (<a onClick={showRemoveIDModal.bind(this, record.id, 'Device')} >Remove</a>)</div>
          )}
        </React.Fragment>
      ),
    },
    {
      title: "Compute Status",
      dataIndex: "eesv_connection_status",
      key: "eesv_connection_status",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text === "up" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {text === "down" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
    ),
    },
    {
      title: "Compute MAC",
      dataIndex: "eesv_mac_address",
      key: "eesv_mac_address",
      render: (text) => (
        <React.Fragment>
        {text === "00:00:00:00:00:00" ? (
          ""
        ) : (
          text
        )}
      </React.Fragment>
      ),
    },
    {
      title: "Link 1/2",
      dataIndex: "link_status0",
      key: "link_status0",
      align: "center",
      render: (text, record) => (
        <React.Fragment>
        {text === "up" ? (
          <>
          <UpCircleFilled style={{"color":"green"}}/>{' / '} 
          </>
        ) : (
          ""
        )}
        {text === "down" ? (
          <>
          <DownCircleFilled style={{"color":"red"}}/>{' / '}
          </>
        ) : (
          ""
        )}
        {record.link_status1 === "up" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {record.link_status1 === "down" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
      )
    },
    {
      title: "Path 1/2",
      dataIndex: "path_status0",
      key: "path_status0",
      align: "center",
      render: (text, record) => (
        <React.Fragment>
        {text === "up" ? (
          <>
          <UpCircleFilled style={{"color":"green"}}/>{' / '} 
          </>
        ) : (
          ""
        )}
        {text === "down" ? (
          <>
          <DownCircleFilled style={{"color":"red"}}/>{' / '}
          </>
        ) : (
          ""
        )}
        {record.path_status1 === "up" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {record.path_status1 === "down" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
      )
    },
    {
      title: "PCIE Status",
      dataIndex: "pcie_connection_status",
      key: "pcie_connection_status",
      align: "center",
      render: (text) => (
        <React.Fragment>
        {text === "up" ? (
          <UpCircleFilled style={{"color":"green"}}/>
        ) : (
          ""
        )}
        {text === "down" ? (
          <DownCircleFilled style={{"color":"red"}}/>
        ) : (
          ""
        )}
      </React.Fragment>
    ),
    },
    {
      title: "PCIE Vendor",
      dataIndex: "pcie_vendor_id",
      key: "pcie_vendor_id",
    },
    {
      title: "PCIE Device Model",
      dataIndex: "pcie_device_id",
      key: "pcie_device_id",
    },
  ]
  
  const { Option } = Select;
  function sortNumbers(a, b) {
    console.log(a + ' ' + b)
    if (a.key < b.key) {
      return 1;
    }
    if (a.key > b.key) {
      return -1;
    }
    return 0;
  }
  var minServerGroupID = 17
  const serverGroupIds = Array(16).fill(0).map(() => minServerGroupID++);

  return (
    <div style={{ padding: 20 }}>
      <div style={{"display":"grid", "gridTemplateColumns":"auto auto"}}>
        <div>
          <Space direction="horizontal" align="center">
            <Icon component={CiscoIconSvg} style={{'fontSize':'50px', 'paddingRight':'30px'}}/>
            <h style={{'fontSize':'30px'}}>Distributed Compute</h>
          </Space>
        </div>
        <div align='right' style={{margin:"auto 0"}}>
          <Space direction="horizontal" align="center">
            <Button type="primary" shape="round" ghost style={{color:'black', "borderColor":'black'}} size="small" onClick={showAboutModal}>About</Button>
            <Modal title="About" visible={isAboutModalVisible} onOk={handleAboutOk} onCancel={handleAboutCancel} okButtonProps={{size:'small', shape:'round'}} 
            cancelButtonProps={{size:'small', shape:'round'}} closable="false">
              <p style={{'fontSize':'20px'}}><b>A GES Americas Office of the CTO Production</b></p>
              <Space direction="horizontal" align="baseline">
                <div>Contributors:<br/></div>
                <div>Brian Shlisky, DSA<br/>
                     Johan Nemitz, TSA</div>
              </Space>
            </Modal>
          </Space>
        </div>
      </div>
      <Divider type="horizontal" style={{'backgroundColor':'black', 'height':'5px', 'margin':'0 auto'}}></Divider>
      <h2 style={{'fontSize':'20px', 'paddingTop':'5px', 'paddingLeft':'20px'}}>Manager</h2>
      <Table columns={apiColData} dataSource={system} rowKey='version_number' size="small" pagination={false}/>
      <h2 style={{'fontSize':'20px', 'paddingTop':'5px', 'paddingLeft':'20px'}}>Compute</h2>
      <Table columns={serverColData} dataSource={processes} rowKey='hostname' size="small" pagination={false} expandable={{
        expandedRowRender: record => {
          return (
            <div style={{'paddingLeft':'80px'}}>
            <h3>Processes</h3>
            <div style={{'paddingLeft':'20px'}}>
              <Table dataSource={record.processes} rowKey='pid' size="small" scroll={{ x: '100%' }} pagination={{"hideOnSinglePage":true}}>
                <Column title="Name" dataIndex="name" key="name" width="20"/>
                <Column title="Process ID" dataIndex="pid" key="pid" width="20"/>
                <Column title="Memory Used" dataIndex="memory_used" key="memory_used" render={(text, record) => (text + ' ' + record.memory_measure)} />
              </Table>
            </div>
            <h3 style={{'paddingTop':'15px'}}>Devices</h3>
            <div style={{'paddingLeft':'20px'}}>
              <Table dataSource={record.devices} rowKey='device_id' size="small" pagination={{"hideOnSinglePage":true}}>
                <Column title="Model" dataIndex="device_name" key="device_name" width="20" />
                <Column title="Brand" dataIndex="device_brand" key="device_brand" width="20" />
                <Column title="Temperature" dataIndex="temp" key="temp"  width="20" render={(text, record) => (text + ' ' + record.temp_measure)} />
                <Column title="Power Draw" dataIndex="power_draw" key="power_draw" width="20" render={(text, record) => (text + ' ' + record.power_measure)} />
              </Table>
            </div>
            </div>
          );
        }
      }}/>
      <h2 style={{'fontSize':'20px', 'paddingTop':'5px', 'paddingLeft':'20px'}}>Compute Devices</h2>
      <Table columns={eesvColData} dataSource={serverDevices} rowKey='id' pagination={false} size="small" expandable={{
        expandedRowRender: record => {
          return (
            <div style={{'paddingLeft':'80px'}}>
            <Table dataSource={record.downstream_ports} rowKey='key' size="small" pagination={{"pageSize":"16", "hideOnSinglePage":true}}>
              <Column title="Port ID" dataIndex="downstream_port_id" key="downstream_port_id" />
              <Column title="Mac Address" dataIndex="eeio_mac_address" key="eeio_mac_address" />
              <Column title="Status" dataIndex="eeio_connection_status" key="eeio_connection_status" align="center" render={(text) => (
                <React.Fragment>
                {text === "up" ? (
                  <UpCircleFilled style={{"color":"green"}}/>
                ) : (
                  ""
                )}
                {text === "down" ? (
                  <DownCircleFilled style={{"color":"red"}}/>
                ) : (
                  ""
                )}
              </React.Fragment>
            )}
            />
            </Table>
            </div>
          );
        }
      }}/>
      <h2 style={{'fontSize':'20px', 'paddingTop':'5px', 'paddingLeft':'20px'}}>GPU Devices</h2>
      <Table columns={eeioColData} dataSource={gpuDevices} rowKey='key' size="small" pagination={false}/>
      <Modal title={changeIDModalTitle} visible={isChangeIDModalVisible} onOk={changeIDform.submit} onCancel={handleChangeIDCancel} confirmLoading={confirmChangeIDLoading}
            okButtonProps={{size:'small', shape:'round'}} cancelButtonProps={{size:'small', shape:'round'}} closable="false" >
        <div style={{'fontSize':'20px', 'fontWeight':'bold'}}>
          <Form
            form={changeIDform}
            name="changeIDForm"
            autoComplete="on"
            onFinish={handleChangeIDOk}>
            <Form.Item
              label="Group ID"
              name="group_id"
              rules={[{ required: true, message: 'Please select a Servers Group ID to change this device to' }]}>
              <Select>
              { changeIDModalTitle.toLowerCase().indexOf('device') !== -1  && serverDevices && serverDevices.map(server => (
                <Option key={server.group_id} value={server.group_id}>{server.group_id}</Option>
              ))}
              { changeIDModalTitle.toLowerCase().indexOf('server') !== -1  && serverGroupIds && serverGroupIds.map(groupid => (
                <Option key={groupid} value={groupid}>{groupid}</Option>
              ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="device_id" hidden={true}>
              <Input/>
            </Form.Item>
          </Form>
        </div>
      </Modal>      
      <Modal title={RemoveIDModalTitle} visible={isRemoveIDModalVisible} onOk={removeIDform.submit} onCancel={handleRemoveIDCancel} confirmLoading={confirmRemoveIDLoading}
            okButtonProps={{size:'small', shape:'round'}} cancelButtonProps={{size:'small', shape:'round'}} closable="false" >
        <div style={{'fontSize':'20px', 'fontWeight':'bold'}}>
          <Form
            form={removeIDform}
            name="removeIDForm"
            autoComplete="on"
            onFinish={handleRemoveIDOk}>
            <Form.Item
              name="device_id" hidden={true}>
              <Input/>
            </Form.Item>
          </Form>
        </div>
      </Modal>      
    </div>
  );
}
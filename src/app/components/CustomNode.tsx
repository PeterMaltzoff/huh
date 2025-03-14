import { memo } from 'react';
import { NodeProps } from 'reactflow';
import DataNode from './nodes/DataNode';

interface CustomNodeData {
  label: string;
  isRoot?: boolean;
  isSpecialFormat?: boolean;
}

const CustomNode = (props: NodeProps<CustomNodeData>) => {
  return <DataNode {...props} />;
};

export default memo(CustomNode); 
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Attachment } from '@/types';

// 附件操作类型
type AttachmentAction =
  | { type: 'ADD_ATTACHMENT'; problemId: number; attachment: Attachment }
  | { type: 'REMOVE_ATTACHMENT'; problemId: number; attachmentId: string }
  | { type: 'UPDATE_ATTACHMENTS'; problemId: number; attachments: Attachment[] }
  | { type: 'BATCH_UPDATE_ATTACHMENTS'; attachmentsMap: Record<number, Attachment[]> }
  | { type: 'CLEAR_ATTACHMENTS'; problemId: number };

// 附件状态接口
interface AttachmentState {
  attachments: Record<number, Attachment[]>;
  globalAttachments: Attachment[]; // 全局共享附件（审批单级别）
}

// 初始状态
const initialState: AttachmentState = {
  attachments: {},
  globalAttachments: []
};

// Reducer
const attachmentReducer = (state: AttachmentState, action: AttachmentAction): AttachmentState => {
  switch (action.type) {
    case 'ADD_ATTACHMENT':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.problemId]: [...(state.attachments[action.problemId] || []), action.attachment]
        }
      };

    case 'REMOVE_ATTACHMENT':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.problemId]: (state.attachments[action.problemId] || []).filter(
            att => att.id !== action.attachmentId
          )
        }
      };

    case 'UPDATE_ATTACHMENTS':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          [action.problemId]: action.attachments
        }
      };

    case 'BATCH_UPDATE_ATTACHMENTS':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          ...action.attachmentsMap
        }
      };

    case 'CLEAR_ATTACHMENTS':
      const { [action.problemId]: removed, ...remainingAttachments } = state.attachments;
      return {
        ...state,
        attachments: remainingAttachments
      };

    default:
      return state;
  }
};

// Context
const AttachmentContext = createContext<{
  state: AttachmentState;
  dispatch: React.Dispatch<AttachmentAction>;
  // 便捷方法
  addAttachment: (problemId: number, attachment: Attachment) => void;
  removeAttachment: (problemId: number, attachmentId: string) => void;
  updateAttachments: (problemId: number, attachments: Attachment[]) => void;
  getAttachments: (problemId: number) => Attachment[];
} | null>(null);

// Provider组件
interface AttachmentProviderProps {
  children: ReactNode;
}

export const AttachmentProvider: React.FC<AttachmentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(attachmentReducer, initialState);

  // 便捷方法
  const addAttachment = (problemId: number, attachment: Attachment) => {
    dispatch({ type: 'ADD_ATTACHMENT', problemId, attachment });
  };

  const removeAttachment = (problemId: number, attachmentId: string) => {
    dispatch({ type: 'REMOVE_ATTACHMENT', problemId, attachmentId });
  };

  const updateAttachments = (problemId: number, attachments: Attachment[]) => {
    dispatch({ type: 'UPDATE_ATTACHMENTS', problemId, attachments });
  };

  const getAttachments = (problemId: number): Attachment[] => {
    return state.attachments[problemId] || [];
  };

  const value = {
    state,
    dispatch,
    addAttachment,
    removeAttachment,
    updateAttachments,
    getAttachments
  };

  return (
    <AttachmentContext.Provider value={value}>
      {children}
    </AttachmentContext.Provider>
  );
};

// Hook
export const useAttachmentContext = () => {
  const context = useContext(AttachmentContext);
  if (!context) {
    throw new Error('useAttachmentContext must be used within an AttachmentProvider');
  }
  return context;
};

export default AttachmentContext;
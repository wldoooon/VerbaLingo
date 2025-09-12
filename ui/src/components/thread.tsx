// Thread component - temporarily disabled due to missing @assistant-ui/react dependency
import type { FC } from "react";

export const Thread: FC = () => {
  return <div>Thread component temporarily disabled</div>;
};

export const ThreadWelcome: FC = () => {
  return <div>ThreadWelcome component temporarily disabled</div>;
};

export const ThreadWelcomeSuggestions: FC = () => {
  return <div>ThreadWelcomeSuggestions component temporarily disabled</div>;
};

export const UserMessage: FC = () => {
  return <div>UserMessage component temporarily disabled</div>;
};

export const EditComposer: FC = () => {
  return <div>EditComposer component temporarily disabled</div>;
};

export const UserActionBar: FC = () => {
  return <div>UserActionBar component temporarily disabled</div>;
};

export const AssistantMessage: FC = () => {
  return <div>AssistantMessage component temporarily disabled</div>;
};

export const AssistantActionBar: FC = () => {
  return <div>AssistantActionBar component temporarily disabled</div>;
};

export const BranchPicker: FC = () => {
  return <div>BranchPicker component temporarily disabled</div>;
};

export const Composer: FC = () => {
  return <div>Composer component temporarily disabled</div>;
};

export const TooltipIconButton: FC<any> = ({ children, tooltip, ...props }) => {
  return <button {...props}>{children}</button>;
};
export type UserDTO = {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarColor: string;
};

export type CommentDTO = {
  id: string;
  body: string;
  createdAt: string;
  author: UserDTO;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  order: number;
  projectId: string;
  assigneeId: string | null;
  project: { id: string; name: string };
  assignee: UserDTO | null;
  comments: CommentDTO[];
};

export type ProjectOption = { id: string; name: string };

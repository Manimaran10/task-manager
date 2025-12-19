// import React, { useState } from 'react';
// import { Plus, Filter, Search } from 'lucide-react';
// import TaskList from '../components/tasks/TaskList';
// import TaskForm from '../components/tasks/TaskForm';
// import Modal from '../components/ui/Modal';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';

// const Tasks: React.FC = () => {
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
//           <p className="text-gray-600">Manage and track all your tasks in one place</p>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <div className="relative flex-1 md:flex-none">
//             <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
//               <Search className="h-4 w-4" />
//             </div>
//             <Input
//               placeholder="Search tasks..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
          
//           <Button variant="outline">
//             <Filter className="h-4 w-4 mr-2" />
//             Filter
//           </Button>
          
//           <Button 
//             variant="primary"
//             onClick={() => setIsCreateModalOpen(true)}
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             New Task
//           </Button>
//         </div>
//       </div>

//       {/* Task List */}
//       <TaskList />

//       {/* Create Task Modal */}
//       <Modal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         title="Create New Task"
//         size="lg"
//       >
//         <TaskForm onSuccess={() => setIsCreateModalOpen(false)} />
//       </Modal>
//     </div>
//   );
// };

// export default Tasks;

import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import SimpleTaskList from '../components/tasks/SimpleTaskList';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Tasks: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600">Manage and track all your tasks in one place</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      <SimpleTaskList />

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm onSuccess={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Tasks;
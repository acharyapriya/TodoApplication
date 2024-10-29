import React, { useEffect, useState } from 'react';
import { 
    CreateTheConnectionLocal, 
    LocalSyncData, 
    MakeTheInstanceConceptLocal, 
    GetCompositionListListener, 
    UpdateComposition, 
    PatcherStructure, 
    PRIVATE, 
    NORMAL 
} from "mftsccs-browser";

const ToDoApp: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const userId = 0;
    const inpage = 10;
    const page = 1;

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = () => {
        GetCompositionListListener("todo_list", userId, inpage, page, NORMAL).subscribe((output: any) => {
                setTasks(output);
                console.log("nf")
            },(error: any) => {
                console.error("Error fetching tasks:", error.message || error);
            }
           
        );
        console.log(tasks,"task")
    };

    const addTask = () => {
        if (!newTaskDescription.trim()) return;

        MakeTheInstanceConceptLocal("todo_list", "", true, userId, PRIVATE)
            .then((mainTask) => MakeTheInstanceConceptLocal("description", newTaskDescription, false, userId, PRIVATE))
            .then((desc) => CreateTheConnectionLocal(desc.id, desc.id, desc.id, 1, "", userId))
            .then(() => {
                LocalSyncData.SyncDataOnline();
                setNewTaskDescription('');
                fetchTasks();
            })
            .catch((error) => {
                console.error("Error adding task:", error.message || error);
            });
    };

    const editTask = (taskId: number, newDescription: string) => {
        const patcher = new PatcherStructure();
        patcher.compositionId = taskId;
        patcher.patchObject = { description: newDescription };

        UpdateComposition(patcher).then(() => {
            LocalSyncData.SyncDataOnline();
            fetchTasks();
        }).catch((error) => {
            console.error("Error updating task:", error.message || error);
        });
    };

    const deleteTask = (taskId: number) => {
        const patcher = new PatcherStructure();
        patcher.compositionId = taskId;
        patcher.patchObject = { deleted: true };

        UpdateComposition(patcher).then(() => {
            LocalSyncData.SyncDataOnline();
            fetchTasks();
        }).catch((error) => {
            console.error("Error deleting task:", error.message || error);
        });
    };

    return (
        <div>
            <h2>To-Do List</h2>
            <input 
                type="text" 
                value={newTaskDescription} 
                onChange={(e) => setNewTaskDescription(e.target.value)} 
                placeholder="New Task" 
            />
            <button onClick={addTask}>Add Task</button>
            <ul>
                {tasks&&(
                    tasks?.map((task) => (
                        task.id ? (
                            <li key={task.id}>
                                {task?.description}
                                <button onClick={() => editTask(task.id, 'Updated Description')}>Edit</button>
                                <button onClick={() => deleteTask(task.id)}>Delete</button>
                            </li>
                        ) : null
                    ))
                )}
            </ul>
        </div>
    );
};

export default ToDoApp;

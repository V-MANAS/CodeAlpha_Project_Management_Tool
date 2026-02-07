import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../configs/api.js";

export const fetchWorkspaces = createAsyncThunk(
    "workspace/fetchWorkspaces",
    async ({ getToken }) => {
        const { data } = await api.get("/api/workspaces", {
            headers: {
                Authorization: `Bearer ${await getToken()}`
            }
        });
        return data.workspaces || [];
    }
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            state.currentWorkspace =
                state.workspaces.find(w => w.id === action.payload) || null;
        },

        addWorkspace: (state, action) => {
            state.workspaces.push(action.payload);
            state.currentWorkspace = action.payload;
        },

        updateWorkspace: (state, action) => {
            state.workspaces = state.workspaces.map(w =>
                w.id === action.payload.id ? action.payload : w
            );

            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },

        deleteWorkspace: (state, action) => {
            state.workspaces = state.workspaces.filter(
                w => w.id !== action.payload
            );
            if (state.currentWorkspace?.id === action.payload) {
                state.currentWorkspace = null;
            }
        },

        addProject: (state, action) => {
            if (!state.currentWorkspace) return;
            state.currentWorkspace.projects.push(action.payload);
        },

        addTask: (state, action) => {
            if (!state.currentWorkspace) return;

            const { projectId } = action.payload;

            state.currentWorkspace.projects.forEach(p => {
                if (p.id === projectId) {
                    p.tasks.push(action.payload);
                }
            });
        },

        updateTask: (state, action) => {
            if (!state.currentWorkspace) return;

            const { projectId, id } = action.payload;

            state.currentWorkspace.projects.forEach(p => {
                if (p.id === projectId) {
                    p.tasks = p.tasks.map(t =>
                        t.id === id ? action.payload : t
                    );
                }
            });
        },

        deleteTask: (state, action) => {
            if (!state.currentWorkspace) return;

            const { projectId, taskIds } = action.payload;

            state.currentWorkspace.projects.forEach(p => {
                if (p.id === projectId) {
                    p.tasks = p.tasks.filter(
                        t => !taskIds.includes(t.id)
                    );
                }
            });
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaces.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.workspaces = action.payload;
                state.loading = false;

                if (action.payload.length > 0) {
                    const savedId = localStorage.getItem("currentWorkspaceId");
                    state.currentWorkspace =
                        action.payload.find(w => w.id === savedId) ||
                        action.payload[0];
                }
            })
            .addCase(fetchWorkspaces.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const {
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    addTask,
    updateTask,
    deleteTask
} = workspaceSlice.actions;

export default workspaceSlice.reducer;

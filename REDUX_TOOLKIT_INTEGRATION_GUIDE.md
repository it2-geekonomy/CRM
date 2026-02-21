# Redux Toolkit Query Integration Guide

## 📚 Complete Step-by-Step Explanation

This guide explains how API integration works using Redux Toolkit Query (RTK Query) in this project.

---

## 🏗️ Architecture Overview

```
apiSlice (base) 
    ↓
taskApiSlice (injected endpoints)
    ↓
React Components (use hooks)
```

---

## Step 1: Base API Slice Setup (`apiSlice.ts`)

**File:** `frontend/src/store/api/apiSlice.ts`

### What it does:
Creates the base API configuration that all endpoints will use.

```typescript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Step 1.1: Configure base URL and headers
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  
  // Step 1.2: Add authentication token to every request
  prepareHeaders: (headers) => {
    if (typeof window === "undefined") return headers;
    
    // Get token from localStorage
    const raw = localStorage.getItem("currentUser");
    const currentUser = raw ? JSON.parse(raw) : null;
    const token = currentUser?.accessToken ?? null;
    
    // Add Bearer token to Authorization header
    if (token) {
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      headers.set("Authorization", authToken);
    }
    return headers;
  },
});

// Step 1.3: Create the base API slice
export const apiSlice = createApi({
  baseQuery,                    // Use the configured base query
  tagTypes: ["Auth", "User", "Employee", "Project", "Admin", "Task"], // Cache tags
  endpoints: () => ({}),       // Empty - endpoints will be injected later
});
```

### Key Concepts:
- **`baseQuery`**: Configures the base URL and automatically adds auth headers
- **`tagTypes`**: Used for cache invalidation (we'll see this later)
- **`endpoints: () => ({})`**: Empty object - we'll inject endpoints in other files

---

## Step 2: Create API Slice for Tasks (`taskApiSlice.ts`)

**File:** `frontend/src/store/api/taskApiSlice.ts`

### Step 2.1: Define TypeScript Types

First, define what data structures you'll work with:

```typescript
// What the backend returns
export type TaskApi = {
  task_id: string;
  task_taskName?: string;
  task_taskStatus?: BackendTaskStatus;
  // ... more fields
};

// What you send to create a task
export type CreateTaskBody = {
  taskName: string;
  taskDescription?: string;
  startDate: string;
  // ... more fields
};

// What you send to update a task
export type UpdateTaskBody = {
  taskName?: string;
  startDate?: string;
  // ... optional fields
};
```

**Why?** TypeScript ensures type safety - you'll get errors if you use wrong data types.

---

### Step 2.2: Inject Endpoints into Base Slice

```typescript
export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Your endpoints go here
  }),
});
```

**Why `injectEndpoints`?** 
- Allows multiple files to add endpoints to the same API slice
- Keeps code organized (tasks in one file, projects in another, etc.)

---

### Step 2.3: Create a Query Endpoint (GET request)

**Query = Fetching data (GET requests)**

```typescript
getTasks: builder.query<TasksResponse, TaskQueryParams | void>({
  // Step 2.3.1: Define the API endpoint URL
  query: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params?.projectId) searchParams.set("projectId", params.projectId);
    const qs = searchParams.toString();
    return { url: `/tasks${qs ? `?${qs}` : ""}` };
  },
  
  // Step 2.3.2: Define cache tags (for automatic refetching)
  providesTags: (result) =>
    result
      ? [
          // Tag each individual task
          ...result.map((t) => ({ type: "Task" as const, id: t.task_id })),
          // Tag the entire list
          { type: "Task", id: "LIST" },
        ]
      : [{ type: "Task", id: "LIST" }],
}),
```

**Explanation:**
- **`builder.query<ResponseType, InputType>`**: 
  - `ResponseType`: What the API returns (`TasksResponse`)
  - `InputType`: What you pass to the query (`TaskQueryParams`)
- **`query` function**: Builds the URL (can add query params, headers, etc.)
- **`providesTags`**: Tells RTK Query "this data is tagged with these tags"
  - When data changes, RTK Query knows what to refetch

**Usage in component:**
```typescript
const { data, isLoading, error } = useGetTasksQuery({ projectId: "123" });
```

---

### Step 2.4: Create a Mutation Endpoint (POST/PATCH/DELETE)

**Mutation = Changing data (POST, PATCH, DELETE requests)**

```typescript
createTask: builder.mutation<ResponseType, InputType>({
  // Step 2.4.1: Define the API endpoint
  query: (body) => ({
    url: "/tasks",
    method: "POST",
    body,  // Request body
  }),
  
  // Step 2.4.2: Invalidate cache tags (trigger refetch)
  invalidatesTags: [{ type: "Task", id: "LIST" }],
}),
```

**Explanation:**
- **`builder.mutation<ResponseType, InputType>`**: 
  - `ResponseType`: What the API returns after mutation
  - `InputType`: What you send in the request body
- **`query` function**: Defines URL, method, and body
- **`invalidatesTags`**: After mutation succeeds, RTK Query automatically refetches any queries that use these tags

**Usage in component:**
```typescript
const [createTask, { isLoading }] = useCreateTaskMutation();

// Later, call it:
await createTask({
  taskName: "New Task",
  startDate: "2026-02-20",
  // ... other fields
});
```

---

### Step 2.5: Complete Example - Checklist Endpoints

```typescript
// GET /tasks/{id}/checklist - Fetch checklist items
getChecklist: builder.query<ChecklistItemApi[], string>({
  query: (taskId) => ({ url: `/tasks/${taskId}/checklist` }),
  providesTags: (_result, _err, taskId) => [
    { type: "Task", id: taskId },
    { type: "Task", id: `${taskId}-checklist` }
  ],
}),

// POST /tasks/{id}/checklist - Create checklist item
createChecklistItem: builder.mutation<ChecklistItemApi, { taskId: string; body: CreateChecklistItemBody }>({
  query: ({ taskId, body }) => ({
    url: `/tasks/${taskId}/checklist`,
    method: "POST",
    body,
  }),
  invalidatesTags: (_result, _err, { taskId }) => [
    { type: "Task", id: taskId },
    { type: "Task", id: `${taskId}-checklist` }
  ],
}),

// PATCH /tasks/{id}/checklist/{itemId} - Update checklist item
updateChecklistItem: builder.mutation<ChecklistItemApi, { taskId: string; itemId: string; body: UpdateChecklistItemBody }>({
  query: ({ taskId, itemId, body }) => ({
    url: `/tasks/${taskId}/checklist/${itemId}`,
    method: "PATCH",
    body,
  }),
  invalidatesTags: (_result, _err, { taskId }) => [
    { type: "Task", id: taskId },
    { type: "Task", id: `${taskId}-checklist` }
  ],
}),

// DELETE /tasks/{id}/checklist/{itemId} - Delete checklist item
deleteChecklistItem: builder.mutation<{ message: string }, { taskId: string; itemId: string }>({
  query: ({ taskId, itemId }) => ({
    url: `/tasks/${taskId}/checklist/${itemId}`,
    method: "DELETE",
  }),
  invalidatesTags: (_result, _err, { taskId }) => [
    { type: "Task", id: taskId },
    { type: "Task", id: `${taskId}-checklist` }
  ],
}),
```

---

### Step 2.6: Export Hooks

RTK Query automatically generates hooks for each endpoint:

```typescript
export const {
  // Query hooks (for GET requests)
  useGetTasksQuery,        // Auto-generated from "getTasks"
  useGetTaskQuery,         // Auto-generated from "getTask"
  useGetChecklistQuery,    // Auto-generated from "getChecklist"
  
  // Mutation hooks (for POST/PATCH/DELETE)
  useCreateTaskMutation,           // Auto-generated from "createTask"
  useUpdateTaskMutation,           // Auto-generated from "updateTask"
  useCreateChecklistItemMutation,  // Auto-generated from "createChecklistItem"
  useUpdateChecklistItemMutation,  // Auto-generated from "updateChecklistItem"
  useDeleteChecklistItemMutation,  // Auto-generated from "deleteChecklistItem"
} = taskApiSlice;
```

**Naming Convention:**
- Query endpoint `getTasks` → Hook `useGetTasksQuery`
- Mutation endpoint `createTask` → Hook `useCreateTaskMutation`

---

## Step 3: Use Hooks in React Components

**File:** `frontend/src/app/admin/dashboard/projects/[id]/tasks/[taskId]/page.tsx`

### Step 3.1: Import Hooks

```typescript
import {
  useGetTaskQuery,
  useGetChecklistQuery,
  useCreateChecklistItemMutation,
  useUpdateChecklistItemMutation,
  useDeleteChecklistItemMutation,
} from "@/store/api/taskApiSlice";
```

---

### Step 3.2: Use Query Hook (Fetch Data)

```typescript
export default function TaskDetailPage() {
  const { taskId } = useParams();
  
  // Fetch task data
  const {
    data: backendTaskData,    // The response data
    isLoading: isLoadingTask, // Loading state
    isError: isTaskError,     // Error state
    error: taskError,          // Error object
  } = useGetTaskQuery(taskId ?? "", { 
    skip: !taskId  // Don't fetch if taskId is missing
  });
  
  // Fetch checklist data
  const {
    data: checklistData,
    isLoading: isLoadingChecklist,
  } = useGetChecklistQuery(taskId ?? "", { 
    skip: !taskId 
  });
  
  // ... rest of component
}
```

**What you get:**
- `data`: The API response (undefined while loading)
- `isLoading`: `true` while fetching
- `isError`: `true` if request failed
- `error`: Error details if failed

---

### Step 3.3: Use Mutation Hook (Change Data)

```typescript
export default function TaskDetailPage() {
  // Get mutation functions
  const [createChecklistItem, { isLoading: isCreating }] = useCreateChecklistItemMutation();
  const [updateChecklistItem] = useUpdateChecklistItemMutation();
  const [deleteChecklistItem] = useDeleteChecklistItemMutation();
  
  // Function to add new checklist item
  const handleAddChecklistItem = async (itemName: string) => {
    try {
      await createChecklistItem({
        taskId: taskId!,
        body: { itemName },
      }).unwrap(); // unwrap() throws error if mutation fails
      
      toast.success("Checklist item added!");
      // RTK Query automatically refetches getChecklist because we invalidated tags
    } catch (error) {
      toast.error("Failed to add checklist item");
    }
  };
  
  // Function to toggle completion
  const toggleChecklistItem = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateChecklistItem({
        taskId: taskId!,
        itemId,
        body: { isCompleted: !currentStatus },
      }).unwrap();
      
      // No toast needed - optimistic update makes it instant
    } catch (error) {
      toast.error("Failed to update checklist item");
    }
  };
  
  // Function to delete checklist item
  const handleDeleteChecklistItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChecklistItem({
        taskId: taskId!,
        itemId,
      }).unwrap();
      
      toast.success("Checklist item deleted");
    } catch (error) {
      toast.error("Failed to delete checklist item");
    }
  };
}
```

**What you get:**
- `[mutationFn, { isLoading, isError, error }]`: 
  - `mutationFn`: Function to call the mutation
  - `isLoading`: `true` while mutation is in progress
  - `isError`: `true` if mutation failed
  - `error`: Error details if failed

---

### Step 3.4: Render Data in JSX

```typescript
return (
  <div>
    {/* Show loading state */}
    {isLoadingTask && <div>Loading task...</div>}
    
    {/* Show error state */}
    {isTaskError && <div>Error: {taskError.message}</div>}
    
    {/* Show data */}
    {backendTaskData && (
      <div>
        <h1>{backendTaskData.task_taskName}</h1>
        <p>{backendTaskData.task_taskDescription}</p>
      </div>
    )}
    
    {/* Checklist section */}
    {isLoadingChecklist ? (
      <div>Loading checklist...</div>
    ) : (
      <div>
        {checklistData?.map((item) => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={item.isCompleted}
              onChange={() => toggleChecklistItem(item.id, item.isCompleted)}
            />
            <span>{item.itemName}</span>
            <button onClick={(e) => handleDeleteChecklistItem(item.id, e)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);
```

---

## 🔄 How Cache Management Works (Tags)

### The Magic of `providesTags` and `invalidatesTags`

**Scenario:** You create a new checklist item. You want the checklist to automatically refresh.

**How it works:**

1. **`getChecklist` provides tags:**
   ```typescript
   providesTags: (_result, _err, taskId) => [
     { type: "Task", id: taskId },
     { type: "Task", id: `${taskId}-checklist` }
   ]
   ```
   This says: "The data from this query is tagged with `Task:taskId` and `Task:taskId-checklist`"

2. **`createChecklistItem` invalidates tags:**
   ```typescript
   invalidatesTags: (_result, _err, { taskId }) => [
     { type: "Task", id: taskId },
     { type: "Task", id: `${taskId}-checklist` }
   ]
   ```
   This says: "After this mutation, invalidate (refetch) all queries tagged with these tags"

3. **Result:** When you create a checklist item:
   - Mutation completes
   - RTK Query sees tags were invalidated
   - RTK Query automatically refetches `getChecklist`
   - UI updates with new data ✨

**No manual refetch needed!** RTK Query handles it automatically.

---

## 📋 Complete Integration Checklist

When integrating a new API endpoint:

### ✅ Step 1: Define Types
```typescript
export type MyApiResponse = { ... };
export type CreateMyBody = { ... };
export type UpdateMyBody = { ... };
```

### ✅ Step 2: Create Endpoint
```typescript
export const myApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyData: builder.query<MyApiResponse, string>({
      query: (id) => ({ url: `/my-endpoint/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "MyTag", id }],
    }),
    createMyData: builder.mutation<MyApiResponse, CreateMyBody>({
      query: (body) => ({
        url: "/my-endpoint",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MyTag", id: "LIST" }],
    }),
  }),
});
```

### ✅ Step 3: Export Hooks
```typescript
export const {
  useGetMyDataQuery,
  useCreateMyDataMutation,
} = myApiSlice;
```

### ✅ Step 4: Use in Component
```typescript
const { data, isLoading } = useGetMyDataQuery("123");
const [createData] = useCreateMyDataMutation();

const handleCreate = async () => {
  await createData({ ... }).unwrap();
};
```

---

## 🎯 Key Takeaways

1. **Base Slice (`apiSlice.ts`)**: Handles auth, base URL, and configuration
2. **Feature Slice (`taskApiSlice.ts`)**: Defines endpoints for a specific feature
3. **Hooks**: Auto-generated, use them in components
4. **Tags**: Connect queries and mutations for automatic cache management
5. **TypeScript**: Define types for type safety

---

## 🚀 Next Steps

1. Try creating a new endpoint for another feature
2. Practice using both query and mutation hooks
3. Experiment with different tag strategies
4. Read RTK Query docs: https://redux-toolkit.js.org/rtk-query/overview

---

**Questions?** Review the code in:
- `frontend/src/store/api/apiSlice.ts` (base setup)
- `frontend/src/store/api/taskApiSlice.ts` (task endpoints)
- `frontend/src/app/admin/dashboard/projects/[id]/tasks/[taskId]/page.tsx` (usage example)

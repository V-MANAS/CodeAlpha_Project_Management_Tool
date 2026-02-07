import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import {
  useOrganization,
  useOrganizationList,
} from "@clerk/clerk-react";

function WorkspaceDropdown() {
  const { workspaces, currentWorkspace } = useSelector(
    (state) => state.workspace
  );

  const { organization } = useOrganization(); // ✅ ACTIVE ORG
  const { createOrganization, setActive, isLoaded } =
    useOrganizationList();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSelectWorkspace = (id) => {
    dispatch(setCurrentWorkspace(id));
    setIsOpen(false);
    navigate("/");
  };

  const handleCreateWorkspace = async () => {
    if (!isLoaded) {
      alert("Auth not ready");
      return;
    }

    const name = prompt("Enter workspace name");
    if (!name || name.trim().length < 3) {
      alert("Workspace name must be at least 3 characters");
      return;
    }

    const org = await createOrganization({
      name: name.trim(),
      slug: `ws-${Date.now()}`, // always unique
    });

    await setActive({ organization: org.id });
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div className="relative m-4" ref={dropdownRef}>
      {/* TOP BUTTON */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* LOGO */}
          {organization?.imageUrl ? (
            <img
              src={organization.imageUrl}
              alt={organization.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
              {organization?.name?.charAt(0) || "W"}
            </div>
          )}

          {/* NAME */}
          <span className="font-medium truncate">
            {organization?.name || "Select Workspace"}
          </span>
        </div>

        <ChevronDown size={16} />
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border rounded shadow-lg mt-1">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onSelectWorkspace(ws.id)}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <span className="flex-1 truncate">{ws.name}</span>
              {currentWorkspace?.id === ws.id && (
                <Check size={14} />
              )}
            </div>
          ))}

          <hr />

          <div
            onClick={handleCreateWorkspace}
            className="p-2 cursor-pointer text-blue-600 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
          >
            <Plus size={14} />
            Create Workspace
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceDropdown;

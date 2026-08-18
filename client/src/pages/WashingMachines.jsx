import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ModalConfirmacion from "../components/ModalConfirmación";
import { formatDateToColombia, formatDateForInput } from "../utils/dateUtils.js";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Función helper para obtener fecha/hora mínima local (Colombia UTC-5)
const getLocalDateTimeMin = () => {
  const now = new Date();
  return formatDateForInput(now);
};

export default function WashingMachines() {
  // Estados para lavadoras
   const [user, setUser] = useState(null);
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [machineForm, setMachineForm] = useState({
    description: "",
    pricePerHour: "",
    initialQuantity: 1,
  });

  // Agrega después de los estados existentes
  const [rentalReminders, setRentalReminders] = useState([]);
  const [loadingRentalReminders, setLoadingRentalReminders] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  // Estados para alquileres
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);

  // Estados para modales
  const [showRentalDetails, setShowRentalDetails] = useState(null);
  const [showExtendHours, setShowExtendHours] = useState(null);
  const [extendHoursForm, setExtendHoursForm] = useState({
    hours: 0,
    additionalPrice: 0,
  });

  // 🔥 NUEVO: Estado para modal de confirmación de entrega
  const [showDeliverConfirmModal, setShowDeliverConfirmModal] = useState(false);
  const [rentalToDeliver, setRentalToDeliver] = useState(null);
  
  // 🔥 NUEVO: Estado para fecha de entrega en extensión de amanecida
  const [deliveryDateTime, setDeliveryDateTime] = useState('');
  
  // 🔥 NUEVO: Estado para tipo de extensión seleccionada
  const [extensionType, setExtensionType] = useState('HOUR'); // 'HOUR' o 'OVERNIGHT'

  // Estados generales
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para paginación
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Estados para paginación de alquileres
  const [searchRentals, setSearchRentals] = useState("");
  const [rentalsPage, setRentalsPage] = useState(1);
  const rentalsPageSize = 10;

  // Después de los estados existentes, agrega:
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);

  // Cargar lavadoras
  useEffect(() => {
    loadMachines();
  }, []);

  // Cargar alquileres activos
  useEffect(() => {
    loadActiveRentals();
  }, []);

   // useEffect para cargar el usuario
  useEffect(() => {
    try {
      const userData = localStorage.getItem('auth_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);
  const loadMachines = async () => {
    try {
      setMachinesLoading(true);
      const token = localStorage.getItem("auth_token");
      // Obtener todas las lavadoras sin límite
      const response = await fetch(`${API_URL}/washing-machines?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al cargar lavadoras");
      const data = await response.json();
      setMachines(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setMachinesLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      setRemindersLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/rentals/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReminders(data.upcomingRentals || []);
      }
    } catch (error) {
      console.error("Error cargando recordatorios:", error);
    } finally {
      setRemindersLoading(false);
    }
  };

  const loadRentalReminders = async () => {
    setLoadingRentalReminders(true);
    try {
      const response = await fetch(`${API_URL}/rentals/reminders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRentalReminders(data.rentals || []);
      }
    } catch (err) {
      console.error("Error cargando recordatorios de alquileres:", err);
    } finally {
      setLoadingRentalReminders(false);
    }
  };

  useEffect(() => {
    loadReminders();
    loadRentalReminders(); // ✅ Agregar esta línea
    const interval = setInterval(() => {
      loadReminders();
      loadRentalReminders(); // ✅ Agregar esta línea
    }, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, []);

  const loadActiveRentals = async () => {
    try {
      setRentalsLoading(true);
      const token = localStorage.getItem("auth_token");
      // Cargar RENTED y OVERDUE en llamadas separadas
      const [rentedResponse, overdueResponse] = await Promise.all([
        fetch(`${API_URL}/rentals?status=RENTED`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/rentals?status=OVERDUE`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!rentedResponse.ok || !overdueResponse.ok) {
        throw new Error("Error al cargar alquileres activos");
      }

      const rentedData = await rentedResponse.json();
      const overdueData = await overdueResponse.json();

      // Combinar ambos resultados
      setActiveRentals([
        ...(rentedData.data || []),
        ...(overdueData.data || []),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setRentalsLoading(false);
    }
  };

  // CRUD Lavadoras
  const handleSubmitMachine = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("auth_token");
      const url = editingMachine
        ? `${API_URL}/washing-machines/${editingMachine.id}`
        : `${API_URL}/washing-machines`;

      const method = editingMachine ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(machineForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar lavadora");
      }

      const data = await response.json();
      setSuccess(
        editingMachine
          ? "Lavadora actualizada correctamente"
          : "Lavadora creada correctamente"
      );

      // Resetear formulario
      setMachineForm({ description: "", pricePerHour: "", initialQuantity: 1 });
      setEditingMachine(null);

      // Recargar lista
      await loadMachines();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditMachine = (machine) => {
    setEditingMachine(machine);
    setMachineForm({
      description: machine.description,
      pricePerHour: machine.pricePerHour,
      initialQuantity: machine.initialQuantity,
    });
  };

  const handleDeleteMachine = async (machine) => {
    try {
      if (!machine) return;
      // Eliminar el confirm() antiguo
      setMachineToDelete(machine);
      setShowDeleteModal(true);
    } catch (error) {
      setError(error.message || "Error eliminando lavadora");
      setTimeout(() => setError(""), 3000);
    }
  };

  // AGREGAR ESTA NUEVA FUNCIÓN:
  const confirmDeleteMachine = async () => {
    try {
      if (!machineToDelete) return;

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_URL}/washing-machines/${machineToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar lavadora");
      }

      setSuccess("Lavadora eliminada correctamente");
      await loadMachines();
      setShowDeleteModal(false);
      setMachineToDelete(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Acciones de alquileres
  const handleDeliverRental = (rental) => {
    // 🔥 MODIFICADO: Mostrar modal de confirmación en lugar de ejecutar directamente
    setRentalToDeliver(rental);
    setShowDeliverConfirmModal(true);
  };

  // 🔥 NUEVO: Función para confirmar la entrega
  const confirmDeliverRental = async () => {
    if (!rentalToDeliver) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/rentals/${rentalToDeliver.id}/deliver`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al entregar alquiler");
      }

      setSuccess("Alquiler entregado correctamente");
      await loadActiveRentals();
      await loadMachines(); // Actualizar stock
      setShowRentalDetails(null);
      setShowDeliverConfirmModal(false);
      setRentalToDeliver(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const sendWhatsAppRentalReminder = (rental) => {
    const message = `Hola ${
      rental.client?.nombre
    }, te recordamos que tu alquiler de lavadora ${
      rental.washingMachine?.description || ""
    } ${
      rental.urgency === "OVERDUE"
        ? "está vencido. Por favor devuelve la lavadora lo antes posible."
        : `debe ser devuelto a las ${new Date(
            rental.scheduledReturnDate
          ).toLocaleTimeString()}.`
    } ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${rental.client?.telefono?.replace(
      /[^\d]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const completeRentalReturn = async (rentalId) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/rentals/${rentalId}/deliver`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al marcar alquiler como devuelto");
      }

      setRentalReminders((prev) => prev.filter((r) => r.id !== rentalId));
      setSuccess("Alquiler marcado como devuelto");
      await Promise.all([loadActiveRentals(), loadMachines(), loadReminders(), loadRentalReminders()]);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error marcando alquiler:", err);
      setError(err.message || "Error al marcar alquiler como devuelto");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Abrir modal de extensión con valores predeterminados
  const handleOpenExtendModal = (rental) => {
    setShowExtendHours(rental);
    setExtensionType("HOUR");
    const pricePerHour = Number(
      rental.washingMachine?.pricePerHour || rental.baseHourlyPrice || 0
    );
    setExtendHoursForm({
      hours: 1,
      additionalPrice: pricePerHour,
    });
    // Fecha y hora sugerida para amanecida: mañana a las 08:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    setDeliveryDateTime(formatDateForInput(tomorrow));
  };

  // Función para extender alquiler (soporta HOUR y OVERNIGHT según selección)
  const handleExtendRental = async () => {
    if (!showExtendHours) return;

    try {
      const token = localStorage.getItem("auth_token");

      let newScheduledReturnDate;
      let requestBody;

      if (extensionType === "OVERNIGHT") {
        if (!deliveryDateTime) {
          setError(
            "Debes seleccionar una fecha y hora de entrega para extensión por amanecida"
          );
          setTimeout(() => setError(""), 3000);
          return;
        }
        newScheduledReturnDate = deliveryDateTime;
        requestBody = {
          scheduledReturnDate: newScheduledReturnDate,
          additionalPrice: extendHoursForm.additionalPrice || 0,
          rentalType: "OVERNIGHT",
          isExtension: true,
        };
      } else {
        const scheduledTime = new Date(
          showExtendHours.scheduledReturnDate
        ).getTime();
        const baseTime =
          scheduledTime > Date.now() ? scheduledTime : Date.now();
        newScheduledReturnDate = new Date(
          baseTime + extendHoursForm.hours * 60 * 60 * 1000
        ).toISOString();
        requestBody = {
          scheduledReturnDate: newScheduledReturnDate,
          additionalPrice: extendHoursForm.additionalPrice || 0,
          hours: extendHoursForm.hours,
          rentalType: "HOUR",
          isExtension: true,
        };
      }

      const response = await fetch(`${API_URL}/rentals/${showExtendHours.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al extender alquiler");
      }

      setSuccess("Alquiler extendido correctamente");
      await Promise.all([
        loadActiveRentals(),
        loadMachines(),
        loadReminders(),
        loadRentalReminders(),
      ]);
      setShowExtendHours(null);
      setExtendHoursForm({ hours: 1, additionalPrice: 0 });
      setDeliveryDateTime("");
      setExtensionType("HOUR");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "RENTED":
        return "bg-blue-100 text-blue-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "RENTED":
        return "Alquilada";
      case "OVERDUE":
        return "Atrasada";
      case "DELIVERED":
        return "Entregada";
      default:
        return status;
    }
  };

  // Filter and paginate machines
  const filteredMachines = machines.filter((machine) =>
    machine.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / pageSize));
  const pageItems = filteredMachines.slice(
    (page - 1) * pageSize,
    page * pageSize
  );


  // Filter and paginate rentals
  const filteredRentals = activeRentals.filter((rental) =>
    rental.client?.nombre.toLowerCase().includes(searchRentals.toLowerCase()) ||
    rental.washingMachine?.description.toLowerCase().includes(searchRentals.toLowerCase())
  );

  const rentalsTotalPages = Math.max(1, Math.ceil(filteredRentals.length / rentalsPageSize));
  const rentalsPageItems = filteredRentals.slice(
    (rentalsPage - 1) * rentalsPageSize,
    rentalsPage * rentalsPageSize
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Alertas */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          🧺 Gestión de Lavadoras
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Control de inventario, alquileres y recordatorios de devolución
        </p>
      </div>

      {/* Dashboard de Recordatorios de Devolución */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
          🚚 Recordatorios de Devolución
          {loadingRentalReminders && (
            <span className="ml-2 text-sm text-orange-600">Cargando...</span>
          )}
        </h3>

        {/* Mensaje informativo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">ℹ️</span>
            <p className="text-sm text-blue-800">
              Las devoluciones se mostrarán{" "}
              <span className="font-semibold">20 minutos antes</span> y seguirán
              visibles si están{" "}
              <span className="font-semibold text-red-600">vencidas</span>.
            </p>
          </div>
        </div>

        {rentalReminders.length > 0 ? (
          <div className="space-y-3">
            {rentalReminders.map((rental) => (
              <div
                key={rental.id}
                className={`bg-white rounded-lg p-3 border ${
                  rental.urgency === "OVERDUE"
                    ? "border-red-300 bg-red-50"
                    : "border-orange-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {rental.client?.nombre || "Cliente"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Lavadora: {rental.washingMachine?.description || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Devolución:{" "}
                      {formatDateToColombia(rental.scheduledReturnDate)}
                      {rental.urgency === "OVERDUE" && (
                        <span className="ml-2 text-red-600 font-semibold">
                          ⚠️ {rental.statusText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => sendWhatsAppRentalReminder(rental)}
                      className="px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                    >
                      💬 WhatsApp
                    </button>
                    <button
                      onClick={() => completeRentalReturn(rental.id)}
                      className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      ✅ Devuelto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">
              ✅ No hay devoluciones pendientes
            </p>
          </div>
        )}
      </div>

      {/* Sección 1: CRUD de Lavadoras - SOLO ADMIN */}
      {user?.role === 'ADMIN' && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Inventario de Lavadoras</h2>

        {/* Formulario */}
        <form
          onSubmit={handleSubmitMachine}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={machineForm.description}
              onChange={(e) =>
                setMachineForm({ ...machineForm, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white placeholder:text-gray-300"
              placeholder="Ej: Lavadora Samsung 8kg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Precio por hora ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={machineForm.pricePerHour}
              onChange={(e) =>
                setMachineForm({ ...machineForm, pricePerHour: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white placeholder:text-gray-300"
              placeholder="5.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Cantidad inicial
            </label>
            <input
              type="number"
              value={machineForm.initialQuantity}
              onChange={(e) =>
                setMachineForm({
                  ...machineForm,
                  initialQuantity: parseInt(e.target.value),
                })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white placeholder:text-gray-300"
              min="1"
              required
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingMachine ? "Actualizar" : "Agregar"}
            </button>
            {editingMachine && (
              <button
                type="button"
                onClick={() => {
                  setEditingMachine(null);
                  setMachineForm({
                    description: "",
                    pricePerHour: "",
                    initialQuantity: 1,
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Recordatorios de Entrega */}
        {reminders.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              ⏰ Recordatorios de Entrega Próximos ({reminders.length})
            </h3>
            <div className="space-y-2">
              {reminders.map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between bg-yellow-100 rounded p-3"
                >
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">{rental.client?.nombre}</div>
                    <div>{rental.washingMachine?.description}</div>
                    <div className="text-xs text-yellow-600">
                      Entrega:{" "}
                      {formatDateToColombia(rental.scheduledReturnDate, {
                        hour: undefined,
                        minute: undefined,
                        second: undefined
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de lavadoras */}
        <div className="flex items-center gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar lavadoras..."
            className="h-10 border rounded-lg px-3 bg-[#3B3B3B] text-white placeholder:text-gray-300"
          />
        </div>
        {machinesLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Descripción</th>
                    <th className="text-center py-2 px-2">Precio/Hora</th>
                    <th className="text-center py-2 px-2">Stock Total</th>
                    <th className="text-center py-2 px-2">Disponibles</th>
                    <th className="text-center py-2 px-2">Alquiladas</th>
                    <th className="text-center py-2 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMachines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">
                        {search
                          ? "No se encontraron lavadoras"
                          : "No hay lavadoras registradas"}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((machine) => (
                      <tr key={machine.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">
                          {machine.description}
                        </td>
                        <td className="text-center py-2 px-2">
                          ${machine.pricePerHour}
                        </td>
                        <td className="text-center py-2 px-2">
                          {machine.initialQuantity}
                        </td>
                        <td className="text-center py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              machine.availableQuantity > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {machine.availableQuantity}
                          </span>
                        </td>
                        <td className="text-center py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (machine.rentedQuantity ?? (machine.initialQuantity - machine.availableQuantity)) > 0
                                ? "bg-amber-100 text-amber-800 font-semibold"
                                : "text-gray-500"
                            }`}
                          >
                            {machine.rentedQuantity !== undefined
                              ? machine.rentedQuantity
                              : Math.max(0, machine.initialQuantity - machine.availableQuantity)}
                          </span>
                        </td>
                        <td className="text-center py-2 px-2">
                          <button
                            onClick={() => handleEditMachine(machine)}
                            className="h-9 px-3 rounded bg-indigo-600 text-white"
                          >
                            📝
                          </button>
                          <button
                            onClick={() => handleDeleteMachine(machine)}
                            className="h-9 px-3 rounded bg-red-600 text-white"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página {page} de {totalPages} — {filteredMachines.length} elementos
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 border rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
)}
      {/* Sección 2: Alquileres Activos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Alquileres Activos</h2>
        
        <div className="flex items-center gap-2 mb-4">
          <input
            value={searchRentals}
            onChange={(e) => {
              setSearchRentals(e.target.value);
              setRentalsPage(1);
            }}
            placeholder="Buscar alquileres..."
            className="h-10 border rounded-lg px-3 bg-[#3B3B3B] text-white placeholder:text-gray-300"
          />
        </div>

        {rentalsLoading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Lavadora</th>
                    <th className="text-left py-2 px-2">Cliente</th>
                    <th className="text-center py-2 px-2">Estado</th>
                    <th className="text-center py-2 px-2">Entrega Programada</th>
                    <th className="text-center py-2 px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRentals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        {searchRentals
                          ? "No se encontraron alquileres"
                          : "No hay alquileres activos"}
                      </td>
                    </tr>
                  ) : (
                    rentalsPageItems.map((rental) => (
                      <tr key={rental.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">
                          {rental.washingMachine.description}
                        </td>
                        <td className="py-2 px-2">
                          <div>
                            <div className="font-medium">
                              {rental.client.nombre}
                            </div>
                            {rental.client.identificacion && (
                              <div className="text-xs text-gray-500">
                                {rental.client.identificacion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              rental.status
                            )}`}
                          >
                            {getStatusText(rental.status)}
                          </span>
                        </td>
                        <td className="text-center py-2 px-2">
                        {formatDateToColombia(rental.scheduledReturnDate)}
                        </td>
                        <td className="text-center py-2 px-2">
                          <button
                            onClick={() => setShowRentalDetails(rental)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            {rental.rentalType === 'OVERNIGHT' ? 'Amanecida 🌙' : 'Por Hora 👁️'}
                          </button>
                          <button
                            onClick={() => handleOpenExtendModal(rental)}
                            className="text-yellow-600 hover:text-yellow-800 mr-2"
                          >
                            Extender ⏰
                          </button>
                          <button
                            onClick={() => handleDeliverRental(rental)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Entregado ✅
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación de alquileres */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Página {rentalsPage} de {rentalsTotalPages} — {filteredRentals.length} elementos
              </div>
              <div className="flex gap-2">
                <button
                  disabled={rentalsPage === 1}
                  onClick={() => setRentalsPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 border rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={rentalsPage === rentalsTotalPages}
                  onClick={() => setRentalsPage((p) => Math.min(rentalsTotalPages, p + 1))}
                  className="h-9 px-3 border rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detalles del Alquiler */}
      {showRentalDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Detalles del Alquiler
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Lavadora:</span>{" "}
                {showRentalDetails.washingMachine.description}
              </div>
              <div>
                <span className="font-medium">Cliente:</span>{" "}
                {showRentalDetails.client.nombre}
              </div>
              <div>
                <span className="font-medium">Identificación:</span>{" "}
                {showRentalDetails.client.identificacion || "N/A"}
              </div>
              <div>
                <span className="font-medium">Teléfono:</span>{" "}
                {showRentalDetails.client.telefono || "N/A"}
              </div>
              <div>
                <span className="font-medium">Dirección:</span>{" "}
                {showRentalDetails.client.direccion || "N/A"}
              </div>
              <div>
                <span className="font-medium">Fecha de alquiler:</span>{" "}
                {formatDateToColombia(showRentalDetails.rentalDate)}
              </div>
              <div>
                <span className="font-medium">Entrega programada:</span>{" "}
                {formatDateToColombia(showRentalDetails.scheduledReturnDate)}
              </div>
              <div>
                <span className="font-medium">Tipo de alquiler:</span>{" "}
                {showRentalDetails.rentalType === 'OVERNIGHT' ? 'Por Amanecida 🌙' : 'Por Hora ⏰'}
              </div>
              <div>
                <span className="font-medium">Horas alquiladas:</span>{" "}
                {showRentalDetails.rentalType === 'OVERNIGHT' ? '1 (Amanecida)' : showRentalDetails.hoursRented}
              </div>
              <div>
                <span className="font-medium">Precio total:</span> $
                {showRentalDetails.rentalPrice}
              </div>
              <div>
                <span className="font-medium">Vendedor:</span>{" "}
                {showRentalDetails.user.nombre}
              </div>
              {showRentalDetails.notes && (
                <div>
                  <span className="font-medium">Notas:</span>{" "}
                  {showRentalDetails.notes}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRentalDetails(null)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Extender Alquiler */}
      {showExtendHours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Extender Alquiler
            </h3>
            
            {/* SELECCIÓN DE TIPO DE EXTENSIÓN */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tipo de extensión:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setExtensionType('HOUR');
                    const pricePerHour = Number(
                      showExtendHours.washingMachine?.pricePerHour ||
                      showExtendHours.baseHourlyPrice ||
                      0
                    );
                    setExtendHoursForm({
                      hours: 1,
                      additionalPrice: pricePerHour,
                    });
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                    extensionType === 'HOUR'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Por Hora ⏰
                </button>
                <button
                  onClick={() => {
                    setExtensionType('OVERNIGHT');
                    const defaultAddPrice = Number(
                      showExtendHours.overnightAdditionalPrice || 2000
                    );
                    setExtendHoursForm((prev) => ({
                      ...prev,
                      additionalPrice: defaultAddPrice,
                    }));
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                    extensionType === 'OVERNIGHT'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Por Amanecida 🌙
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* 🔥 CAMPOS SEGÚN TIPO DE EXTENSIÓN SELECCIONADA */}
              {extensionType === 'OVERNIGHT' ? (
                <>
                  {/* Para AMANECIDA: Mostrar fecha de entrega y precio adicional */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nueva fecha y hora de entrega
                    </label>
                    <input
                      type="datetime-local"
                      value={deliveryDateTime}
                      onChange={(e) => setDeliveryDateTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white dark-date-input"
                      min={getLocalDateTimeMin()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Precio adicional por extensión
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={extendHoursForm.additionalPrice}
                      onChange={(e) =>
                        setExtendHoursForm({
                          ...extendHoursForm,
                          additionalPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white placeholder:text-gray-300"
                      placeholder="0.00"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Valor adicional por extender la entrega
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Para HORAS: Mostrar horas adicionales y cálculo automático */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Horas adicionales
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={extendHoursForm.hours}
                      onChange={(e) => {
                        const hours = parseInt(e.target.value) || 1;
                        const additionalPrice = showExtendHours.washingMachine
                          ? Number(showExtendHours.washingMachine.pricePerHour) *
                            hours
                          : 0;
                        setExtendHoursForm({
                          ...extendHoursForm,
                          hours,
                          additionalPrice,
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Precio adicional (calculado automáticamente)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={extendHoursForm.additionalPrice}
                      onChange={(e) =>
                        setExtendHoursForm({
                          ...extendHoursForm,
                          additionalPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-[#3B3B3B] text-white placeholder:text-gray-300"
                      placeholder="0.00"
                      
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      ${showExtendHours.washingMachine?.pricePerHour || 0} ×{" "}
                      {extendHoursForm.hours} horas = $
                      {extendHoursForm.additionalPrice}
                    </div>
                  </div>
                </>
              )}

              {/* 🔥 INFORMACIÓN ADICIONAL */}
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="mb-2">
                  <strong>Alquiler actual:</strong> {showExtendHours.rentalType === 'OVERNIGHT' ? 'Por Amanecida 🌙' : 'Por Hora ⏰'}
                </div>
                <div className="mb-2">
                  <strong>Extensión seleccionada:</strong> {extensionType === 'OVERNIGHT' ? 'Por Amanecida 🌙' : 'Por Hora ⏰'}
                </div>
                <div className="mb-2">
                  <strong>Precio base:</strong> ${showExtendHours.baseHourlyPrice || showExtendHours.washingMachine?.pricePerHour || 0}
                </div>
                <div>
                  <strong>Nueva entrega programada:</strong>{" "}
                  {extensionType === 'OVERNIGHT' ? (
                    deliveryDateTime ? formatDateToColombia(deliveryDateTime) : "Selecciona fecha"
                  ) : (
                    formatDateToColombia(
                      new Date(
                        (new Date(showExtendHours.scheduledReturnDate).getTime() > Date.now()
                          ? new Date(showExtendHours.scheduledReturnDate).getTime()
                          : Date.now()) +
                          extendHoursForm.hours * 60 * 60 * 1000
                      ).toISOString()
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowExtendHours(null);
                  setExtendHoursForm({ hours: 1, additionalPrice: 0 });
                  setDeliveryDateTime('');
                  setExtensionType('HOUR');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleExtendRental}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Extender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 NUEVO: Modal de Confirmación de Entrega */}
      {showDeliverConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Confirmar Entrega de Lavadora
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Lavadora:</span>{" "}
                {rentalToDeliver?.washingMachine?.description}
              </div>
              <div>
                <span className="font-medium">Cliente:</span>{" "}
                {rentalToDeliver?.client?.nombre}
              </div>
              <div>
                <span className="font-medium">Tipo de alquiler:</span>{" "}
                {rentalToDeliver?.rentalType === 'OVERNIGHT' ? 'Por Amanecida 🌙' : 'Por Hora ⏰'}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ ¿Está seguro de que desea marcar este alquiler como entregado?
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Esta acción registrará la devolución de la lavadora y actualizará el inventario.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowDeliverConfirmModal(false);
                  setRentalToDeliver(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeliverRental}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirmar Entrega ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <ModalConfirmacion
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMachineToDelete(null);
        }}
        onConfirm={confirmDeleteMachine}
        title="Eliminar Lavadora"
        message={`¿Está seguro de que desea eliminar la lavadora "${machineToDelete?.description}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}

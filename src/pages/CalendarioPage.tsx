import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg, DatesSetArg, EventInput } from '@fullcalendar/core';
import { calendarioService, type DiaCalendario, type TransaccionSummary } from '../services/calendarioService';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { sectionHelp } from '../utils/helpContent';

export const CalendarioPage = () => {
    const [eventos, setEventos] = useState<EventInput[]>([]);
    const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
    const [anoActual, setAnoActual] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState<DiaCalendario | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const loadCalendario = async () => {
            try {
                const data = await calendarioService.getCalendario(mesActual, anoActual);

                // Calculate max daily amounts for intensity scaling
                const maxGasto = Math.max(...data.dias.map(d => d.totalGastos), 0);
                const maxIngreso = Math.max(...data.dias.map(d => d.totalIngresos), 0);

                const eventosFormateados = data.dias.flatMap(dia => {
                    const events: EventInput[] = [];

                    if (dia.totalGastos > 0) {
                        const intensity = maxGasto > 0
                            ? Math.max(0.3, Math.min(1, dia.totalGastos / maxGasto))
                            : 0.5;
                        events.push({
                            title: `$${dia.totalGastos.toFixed(2)}`,
                            start: dia.fecha,
                            backgroundColor: `rgba(239, 68, 68, ${intensity})`,
                            borderColor: `rgba(220, 38, 38, ${intensity})`,
                            textColor: intensity >= 0.6 ? '#fff' : '#991b1b',
                            extendedProps: {
                                tipo: 'Gasto',
                                dia
                            }
                        });
                    }

                    if (dia.totalIngresos > 0) {
                        const intensity = maxIngreso > 0
                            ? Math.max(0.3, Math.min(1, dia.totalIngresos / maxIngreso))
                            : 0.5;
                        events.push({
                            title: `$${dia.totalIngresos.toFixed(2)}`,
                            start: dia.fecha,
                            backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                            borderColor: `rgba(5, 150, 105, ${intensity})`,
                            textColor: intensity >= 0.6 ? '#fff' : '#065f46',
                            extendedProps: {
                                tipo: 'Ingreso',
                                dia
                            }
                        });
                    }

                    return events;
                });

                setEventos(eventosFormateados);
            } catch (error) {
                toast.error('Error al cargar calendario');
            }
        };
        loadCalendario();
    }, [mesActual, anoActual]);

    const handleEventClick = (clickInfo: EventClickArg) => {
        const dia = clickInfo.event.extendedProps?.dia as DiaCalendario | undefined;
        if (dia) {
            setSelectedDay(dia);
            setShowModal(true);
        }
    };

    const handleDateClick = (selectInfo: DateSelectArg) => {
        const fecha = selectInfo.startStr.split('T')[0];
        const dia = eventos.find(e => e.extendedProps?.dia?.fecha === fecha)?.extendedProps?.dia;
        if (dia) {
            setSelectedDay(dia);
            setShowModal(true);
        }
    };

    const handleDatesSet = (arg: DatesSetArg) => {
        const fecha = new Date(arg.view.currentStart);
        setMesActual(fecha.getMonth() + 1);
        setAnoActual(fecha.getFullYear());
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">Calendario financiero <HelpTooltip content={sectionHelp.calendario} /></h1>
                <p className="text-gray-600 mt-2">
                    Vista de calendario de tus ingresos y gastos
                </p>
            </div>

            <div className="bg-white rounded-lg shadow p-2 md:p-6">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: isMobile ? 'prev,next' : 'prev,next today',
                        center: 'title',
                        right: isMobile ? 'dayGridMonth,timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={eventos}
                    eventClick={handleEventClick}
                    select={handleDateClick}
                    datesSet={handleDatesSet}
                    height="auto"
                    locale="es"
                    buttonText={{
                        today: 'Hoy',
                        month: 'Mes',
                        week: 'Semana',
                        day: 'Día'
                    }}
                    windowResizeDelay={100}
                    contentHeight="auto"
                    aspectRatio={isMobile ? 0.8 : 1.35}
                />
            </div>

            {/* Modal de detalles del día */}
            {showModal && selectedDay && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                    {new Date(selectedDay.fecha).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </h2>
                                <div className="mt-2 flex gap-4">
                                    <div className="text-green-600 font-semibold text-sm md:text-base">
                                        Ingresos: ${selectedDay.totalIngresos.toFixed(2)}
                                    </div>
                                    <div className="text-red-600 font-semibold text-sm md:text-base">
                                        Gastos: ${selectedDay.totalGastos.toFixed(2)}
                                    </div>
                                    <div className={`font-semibold text-sm md:text-base ${selectedDay.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Balance: ${selectedDay.balance.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Cerrar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <h3 className="text-lg font-semibold mb-4">
                                Transacciones ({selectedDay.cantidadTransacciones})
                            </h3>
                            <div className="space-y-2">
                                {selectedDay.transacciones.map((transaccion: TransaccionSummary, index: number) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border-l-4 ${transaccion.tipo === 'Gasto'
                                                ? 'bg-red-50 border-red-500'
                                                : 'bg-green-50 border-green-500'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold text-gray-900">
                                                    {transaccion.descripcion}
                                                </div>
                                                {transaccion.categoriaNombre && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {transaccion.categoriaNombre}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`font-bold text-lg ${transaccion.tipo === 'Gasto' ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {transaccion.tipo === 'Gasto' ? '-' : '+'}${transaccion.monto.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

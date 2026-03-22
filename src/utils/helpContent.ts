// Contenido de ayuda contextual por sección
export interface SectionHelp {
    title: string;
    description: string;
    tips: string[];
}

export const sectionHelp: Record<string, SectionHelp> = {
    dashboard: {
        title: 'Tu Panel Principal',
        description: 'Aqui ves un resumen de tus finanzas del mes actual: cuanto ingresaste, cuanto gastaste y tu balance.',
        tips: [
            'El balance es la diferencia entre tus ingresos y gastos del mes. Ej: si ingresaste $1,000 y gastaste $800, tu balance es +$200',
            'El porcentaje "vs Mes Anterior" compara tus gastos con el mes pasado. Ej: si subio un 15%, estas gastando mas que antes',
            'El grafico de tendencia te muestra como han cambiado tus finanzas en los ultimos 6 meses',
            'Las categorias del mes te muestran en que gastas mas dinero. Ej: si Alimentacion aparece primero, ahi se va la mayor parte',
        ],
    },
    gastos: {
        title: 'Registro de Gastos',
        description: 'Aqui llevas el control de todo lo que gastas. Registra cada gasto con su monto, categoria y fecha para tener visibilidad de tu dinero.',
        tips: [
            'Un gasto "Fijo" es algo que pagas siempre (renta, internet). "Variable" es algo que cambia (comida, entretenimiento). Ej: tu renta de $500 es fijo, el almuerzo de hoy es variable',
            'Usa las categorias para organizar tus gastos y ver patrones. Ej: "Transporte", "Alimentacion", "Entretenimiento"',
            'Puedes usar los filtros avanzados para buscar gastos por fecha o rango de monto. Ej: ver solo gastos mayores a $50 del ultimo mes',
            '"Sin asignar" indica cuanto del gasto aun no tiene sub-compras registradas. Es diferente al "Disponible" del presupuesto, que muestra cuanto queda de tu limite',
            'Al transferir saldo entre gastos, el historial de movimientos aparece debajo del monto. Ej: "-$5.00 → Alimentacion"',
        ],
    },
    ingresos: {
        title: 'Registro de Ingresos',
        description: 'Aqui registras todo el dinero que recibes: salario, freelance, ventas, etc. Esto te ayuda a saber cuanto dinero entra cada mes.',
        tips: [
            'Registra todos tus ingresos, no solo el salario. Ej: freelance, renta de propiedad, venta de algo, regalo',
            'Categorizar tus ingresos te ayuda a diversificar tus fuentes. Ej: "Salario", "Freelance", "Inversiones", "Ventas"',
            'Compara tus ingresos vs gastos en el Dashboard para ver si estas ahorrando. Ej: $1,500 ingresos - $1,200 gastos = $300 de ahorro',
        ],
    },
    presupuestos: {
        title: 'Control de Presupuestos',
        description: 'Un presupuesto es un limite que te pones para no gastar de mas en una categoria. Por ejemplo: "No gastar mas de $200 en comida esta semana".',
        tips: [
            'Verde = vas bien, Naranja = cuidado (mas del 80%), Rojo = excediste el limite. Ej: si tu presupuesto de comida es $200 y llevas $170, estas en naranja',
            'Empieza con las categorias donde mas gastas. Ej: si gastas $300/semana en comida, pon un limite de $250 e intenta ajustarte',
            'El periodo se reinicia solo. Ej: un presupuesto semanal de $200 arranca de cero cada lunes, no se acumula',
            '"Disponible" aqui significa cuanto te queda de tu limite. Ej: presupuesto de $200, gastaste $120, disponible = $80',
            'Las transferencias entre gastos se muestran al pie de cada tarjeta para que veas como se redistribuyo el dinero',
        ],
    },
    metas: {
        title: 'Metas de Ahorro',
        description: 'Una meta es un objetivo financiero que quieres alcanzar. Define cuanto necesitas y ve abonando poco a poco hasta lograrlo.',
        tips: [
            'Ponle un nombre motivador a tu meta. Ej: "Vacaciones en la playa $2,000", "Fondo de emergencia $5,000", "Laptop nueva $800"',
            'Abona regularmente aunque sea poco. Ej: $50 cada quincena = $1,200 al ano. La constancia es clave',
            'La barra de progreso te muestra que tan cerca estas. Ej: llevas $600 de $1,000 = 60% completado',
        ],
    },
    cuentas: {
        title: 'Tus Cuentas',
        description: 'Aqui gestionas tus cuentas de dinero: efectivo, banco, tarjeta, ahorro, etc. Cada cuenta lleva su propio balance.',
        tips: [
            'Crea una cuenta por cada lugar donde tengas dinero. Ej: "BAC salario", "Efectivo cartera", "Ahorro emergencia"',
            'El balance se actualiza automaticamente al registrar gastos e ingresos. Ej: si tu cuenta tiene $500 y registras un gasto de $50, baja a $450',
            'Puedes transferir dinero entre cuentas desde la seccion "Transferir". Ej: mover $200 de tu cuenta de banco a tu cuenta de ahorro',
            'Tipos de cuenta: Efectivo (lo que llevas encima), Cuenta Bancaria (tu banco), Tarjeta de Credito, Ahorros, Inversion',
        ],
    },
    categorias: {
        title: 'Categorias',
        description: 'Las categorias te ayudan a clasificar tus gastos e ingresos. Por ejemplo: Alimentacion, Transporte, Salario, etc.',
        tips: [
            'Crea categorias que tengan sentido para ti. Ej para gastos: "Alimentacion", "Transporte", "Servicios", "Entretenimiento", "Salud"',
            'Para ingresos: "Salario", "Freelance", "Inversiones", "Ventas", "Regalos"',
            'No crees demasiadas categorias, entre 5 y 10 por tipo es suficiente. Si tienes muchas, sera dificil analizar patrones',
            'Puedes crear subcategorias. Ej: dentro de "Alimentacion" tener "Supermercado" y "Restaurantes"',
        ],
    },
    transferencias: {
        title: 'Transferencias entre Cuentas',
        description: 'Mueve dinero entre tus propias cuentas. No es un gasto ni un ingreso, es solo mover dinero de un lugar a otro.',
        tips: [
            'Una transferencia NO afecta tu balance total. Ej: mover $200 de Banco a Ahorro no cambia cuanto dinero tienes en total',
            'Selecciona cuenta origen (de donde sale) y destino (a donde llega). Ej: Origen: "BAC salario" → Destino: "Ahorro emergencia"',
            'Usa transferencias para separar tu ahorro. Ej: cada quincena transferir $100 a tu cuenta de ahorro',
        ],
    },
    gastosRecurrentes: {
        title: 'Gastos Recurrentes',
        description: 'Son gastos que se repiten automaticamente cada cierto tiempo. El sistema los genera por ti para que no olvides registrarlos.',
        tips: [
            'Configura tus gastos fijos aqui. Ej: "Renta $500 mensual dia 1", "Internet $40 mensual dia 15", "Netflix $15 mensual dia 5"',
            'Frecuencias disponibles: Semanal, Quincenal, Mensual, Anual. Ej: el bus al trabajo puede ser semanal, la renta mensual',
            'El sistema te recordara 3 dias antes del pago. Ej: si tu renta vence el dia 1, te avisa el dia 28',
            'Puedes activar o desactivar un gasto recurrente sin eliminarlo. Ej: si cancelaste Netflix, desactivalo y si vuelves, activalo',
        ],
    },
    ingresosRecurrentes: {
        title: 'Ingresos Recurrentes',
        description: 'Son ingresos que recibes regularmente. El sistema los registra automaticamente para que no tengas que hacerlo manualmente.',
        tips: [
            'Registra tu salario aqui. Ej: "Salario $1,500 quincenal dia 15 y 30", o "Salario $3,000 mensual dia 1"',
            'Tambien funciona para otros ingresos fijos. Ej: "Renta departamento $400 mensual dia 5", "Pension $200 mensual dia 10"',
            'Esto ayuda al sistema a proyectar tu flujo de caja. Ej: saber cuanto dinero entra cada mes automaticamente',
        ],
    },
    reportes: {
        title: 'Reportes Financieros',
        description: 'Graficos detallados de tus finanzas: tendencias, comparaciones entre meses y tus categorias principales de gasto.',
        tips: [
            'Usa los reportes para identificar patrones. Ej: si notas que en diciembre siempre gastas el doble, puedes planificar mejor',
            'Compara diferentes meses para ver si estas mejorando. Ej: "En enero gaste $500 en comida, en febrero baje a $400"',
            'Puedes exportar tus datos a PDF. Ej: para llevar un registro impreso o compartirlo con tu pareja',
        ],
    },
    gastosProgramados: {
        title: 'Gastos Programados',
        description: 'Pagos con fecha limite conocida. Ideal para recibos de servicios, suscripciones y cualquier cobro con fecha especifica.',
        tips: [
            'Usa "Monto variable" para recibos que cambian. Ej: la luz puede ser $30 un mes y $50 otro. Pon un estimado y ajusta al pagar',
            'Usa "Monto fijo" para pagos que siempre son iguales. Ej: renta $500, Netflix $15, seguro $80',
            'Asigna una cuenta para que el descuento sea automatico. Ej: "Recibo de luz, cuenta BAC, vence 25 de cada mes"',
            'Los gastos fijos con cuenta se cobran automaticamente en la fecha. Los variables te esperan para que pongas el monto real',
            'Filtra por estado para ver solo los pendientes, pagados o vencidos',
        ],
    },
    deudas: {
        title: 'Control de Deudas',
        description: 'Lleva el registro de tus deudas: tarjetas de credito, prestamos, hipotecas, etc. Registra pagos y ve como baja tu saldo.',
        tips: [
            'Registra todas tus deudas para tener vision completa. Ej: "Tarjeta VISA $2,000", "Prestamo personal $5,000", "Hipoteca $80,000"',
            'Anota la tasa de interes para priorizar. Ej: tarjeta al 45% anual vs prestamo al 12%. Paga primero la tarjeta',
            'Registra cada pago que hagas. Ej: "Pago tarjeta $200 - $150 capital + $50 intereses". Veras como baja tu saldo',
            'El dia de pago te ayuda a recordar. Ej: "Tarjeta VISA vence dia 15 de cada mes, pago minimo $150"',
        ],
    },
    tags: {
        title: 'Etiquetas (Tags)',
        description: 'Los tags son etiquetas extra para organizar gastos e ingresos por contexto, evento o proyecto. Cruzan todas las categorias.',
        tips: [
            'Usa tags para agrupar por contexto. Ej: tag "trabajo" para almuerzo de trabajo + pasaje al trabajo + materiales de oficina',
            'Un gasto puede tener varios tags. Ej: "Almuerzo con cliente" puede tener los tags "trabajo" y "necesario"',
            'Ideal para eventos o proyectos. Ej: tag "vacaciones-2026" para vuelos + hotel + comida + souvenirs del viaje',
            'Despues puedes filtrar por tag para ver cuanto gastaste en total en ese contexto. Ej: "Las vacaciones me costaron $1,500 en total"',
        ],
    },
    gastosCompartidos: {
        title: 'Gastos Compartidos',
        description: 'Para gastos que divides con otras personas. Registra cuanto pago cada quien y lleva el control de quien debe a quien.',
        tips: [
            'Crea un gasto compartido con los participantes. Ej: "Cena grupal $60" dividida entre 3 personas = $20 cada uno',
            'Metodos de division: Equitativo (partes iguales), Porcentaje (ej: 60%-40%), Monto fijo (cada quien un monto diferente)',
            'Marca como "Liquidado" cuando alguien te pague su parte. Ej: Juan te debe $20, cuando te pague marcalo como pagado',
            'Util para viajes en grupo, cenas, regalos compartidos, gastos del hogar con roommates',
        ],
    },
    plantillas: {
        title: 'Plantillas de Gasto',
        description: 'Atajos para gastos frecuentes que no son automaticos. Crea una plantilla y registra el gasto con un solo clic.',
        tips: [
            'Crea plantillas para gastos del dia a dia. Ej: "Almuerzo trabajo" (Alimentacion, Variable, cuenta BAC)',
            'Solo falta poner el monto y la fecha. Todo lo demas se llena automaticamente desde la plantilla',
            'Diferente a recurrentes: la plantilla la usas cuando tu quieras, el recurrente se genera solo cada periodo',
            'Ej: "Cafe diario" - Categoria: Alimentacion, Tipo: Variable, Cuenta: Efectivo. Solo pones $2.50 y listo',
        ],
    },
    reglasCategoria: {
        title: 'Auto-categorizacion',
        description: 'Reglas para que el sistema asigne categorias automaticamente al crear gastos o importar CSV. Se basa en la descripcion del gasto.',
        tips: [
            'Crea patrones que coincidan con tus gastos. Ej: patron "uber" → categoria "Transporte". Cualquier gasto con "uber" en la descripcion se categoriza solo',
            'Tipos de coincidencia: "Contiene" (lo mas flexible), "Exacto" (debe ser identico), "Comienza con". Ej: "Contiene: pasaje" detecta "Pago de pasajes"',
            'La prioridad resuelve conflictos. Ej: "cafe" → Alimentacion (prioridad 0) y "cafe oficina" → Gastos trabajo (prioridad 1). Gana la mas alta',
            'Muy util al importar CSV del banco: las reglas categorizan cientos de transacciones automaticamente',
        ],
    },
    importacionCsv: {
        title: 'Importar CSV',
        description: 'Importa gastos o ingresos desde un archivo CSV (Excel guardado como CSV). Ideal para cargar historial del banco o de otra app.',
        tips: [
            'Tu archivo CSV debe tener columnas como: Fecha, Descripcion, Monto, Categoria. Ej: "2026-03-15, Supermercado, 45.00, Alimentacion"',
            'Si tienes reglas de auto-categorizacion, el sistema asigna categorias automaticamente al importar',
            'Revisa los datos antes de confirmar la importacion. Puedes corregir categorias o descartar filas que no quieras',
            'Util si cambias de app o quieres cargar el historial de tu estado de cuenta bancario',
        ],
    },
    notificaciones: {
        title: 'Notificaciones',
        description: 'El sistema te envia avisos automaticos sobre tus finanzas: alertas de presupuesto, pagos proximos, gastos inusuales y mas.',
        tips: [
            'Alerta de presupuesto: cuando te acercas al limite. Ej: "Llevas 85% de tu presupuesto de Alimentacion ($170 de $200)"',
            'Pago proximo: te avisa antes de que venza un cobro. Ej: "Tu recibo de luz vence en 3 dias"',
            'Gasto inusual: si un gasto es mucho mayor al promedio. Ej: "Gastaste $150 en Transporte, tu promedio es $50"',
            'Puedes configurar que tipos de notificaciones quieres recibir desde tu perfil',
        ],
    },
    calendario: {
        title: 'Calendario Financiero',
        description: 'Vista de calendario que muestra tus gastos e ingresos por dia. Te permite ver de un vistazo cuando entro y salio dinero.',
        tips: [
            'Cada dia muestra el total de gastos (rojo) e ingresos (verde). Ej: el dia 15 puede mostrar +$1,500 (salario) y -$500 (renta)',
            'Haz clic en un dia para ver el detalle de las transacciones de ese dia',
            'Util para detectar patrones. Ej: si todos los viernes gastas mas, puedes planificar mejor tu semana',
            'Navega entre meses para comparar tu actividad financiera',
        ],
    },
    comparacion: {
        title: 'Comparacion de Periodos',
        description: 'Compara tus finanzas entre dos periodos diferentes. Ve si estas gastando mas o menos que antes y en que categorias cambio.',
        tips: [
            'Compara mes a mes. Ej: "Febrero vs Enero" para ver si bajaste tus gastos de comida',
            'Ve que categorias subieron o bajaron. Ej: "Transporte subio $30 pero Entretenimiento bajo $50"',
            'Util para evaluar si tus cambios de habitos estan funcionando. Ej: "Desde que cocino en casa, Alimentacion bajo un 25%"',
        ],
    },
};

// Glosario de términos financieros
export interface GlossaryTerm {
    term: string;
    definition: string;
}

export const financialGlossary: GlossaryTerm[] = [
    { term: 'Balance', definition: 'La diferencia entre tus ingresos y gastos. Si es positivo, estas ahorrando. Si es negativo, estas gastando mas de lo que ganas.' },
    { term: 'Presupuesto', definition: 'Un limite de gasto que te pones para una categoria especifica. Te ayuda a controlar en que y cuanto gastas.' },
    { term: 'Meta de ahorro', definition: 'Un objetivo financiero con un monto especifico que quieres alcanzar ahorrando poco a poco.' },
    { term: 'Gasto fijo', definition: 'Un gasto que pagas regularmente y cuyo monto no cambia mucho. Ejemplos: renta, internet, seguros.' },
    { term: 'Gasto variable', definition: 'Un gasto que cambia cada mes segun tus decisiones. Ejemplos: comida fuera, entretenimiento, ropa.' },
    { term: 'Gasto recurrente', definition: 'Un gasto que se repite automaticamente cada cierto periodo (semanal, quincenal, mensual).' },
    { term: 'Ingreso recurrente', definition: 'Dinero que recibes de forma regular, como tu salario o renta de una propiedad.' },
    { term: 'Transferencia', definition: 'Mover dinero entre tus propias cuentas. No es un gasto ni ingreso, solo un movimiento interno.' },
    { term: 'Categoria', definition: 'Una clasificacion para organizar tus gastos e ingresos. Ejemplo: Alimentacion, Transporte, Salario.' },
    { term: 'Flujo de caja', definition: 'Una proyeccion de cuanto dinero tendras en el futuro basandose en tus ingresos y gastos esperados.' },
    { term: 'Tipo de cambio', definition: 'El valor de una moneda en relacion a otra. Util si manejas dinero en diferentes monedas.' },
    { term: 'Amortizacion', definition: 'El proceso de pagar una deuda poco a poco. Cada pago cubre parte del capital y parte de los intereses.' },
    { term: 'Tasa de interes', definition: 'El porcentaje extra que se cobra sobre una deuda. A mayor tasa, mas pagaras en total.' },
    { term: 'Diversificar ingresos', definition: 'Tener varias fuentes de ingreso para no depender de una sola. Reduce el riesgo financiero.' },
    { term: 'Fondo de emergencia', definition: 'Dinero ahorrado para imprevistos (3-6 meses de gastos). Es la base de la salud financiera.' },
];

// Mensajes para empty states educativos
export interface EmptyStateContent {
    icon: string;
    title: string;
    description: string;
    actionLabel: string;
}

export const emptyStates: Record<string, EmptyStateContent> = {
    gastos: {
        icon: 'receipt',
        title: 'Aun no tienes gastos registrados',
        description: 'Registra tu primer gasto para empezar a llevar el control de tu dinero. Puedes agregar la descripcion, el monto y la categoria.',
        actionLabel: 'Registrar mi primer gasto',
    },
    ingresos: {
        icon: 'banknote',
        title: 'Aun no tienes ingresos registrados',
        description: 'Registra tu salario u otros ingresos para saber cuanto dinero entra cada mes y poder compararlo con tus gastos.',
        actionLabel: 'Registrar mi primer ingreso',
    },
    presupuestos: {
        icon: 'piggy-bank',
        title: 'No tienes presupuestos configurados',
        description: 'Un presupuesto te ayuda a no gastar de mas. Define un limite para cada categoria (ej: $3,000 en comida) y el sistema te avisara si te acercas.',
        actionLabel: 'Crear mi primer presupuesto',
    },
    metas: {
        icon: 'target',
        title: 'Aun no tienes metas de ahorro',
        description: 'Ponte un objetivo financiero: unas vacaciones, un fondo de emergencia o algo que quieras comprar. Define el monto y abona poco a poco.',
        actionLabel: 'Crear mi primera meta',
    },
    cuentas: {
        icon: 'wallet',
        title: 'No tienes cuentas registradas',
        description: 'Crea tus cuentas para llevar el control de tu dinero: efectivo, cuenta de banco, tarjeta, ahorro, etc.',
        actionLabel: 'Crear mi primera cuenta',
    },
    categorias: {
        icon: 'tags',
        title: 'No hay categorias creadas',
        description: 'Las categorias te ayudan a organizar tus gastos e ingresos. Crea categorias como: Alimentacion, Transporte, Salario, Freelance, etc.',
        actionLabel: 'Crear mi primera categoria',
    },
    tags: {
        icon: 'tag',
        title: 'No tienes etiquetas creadas',
        description: 'Las etiquetas te permiten agrupar transacciones por eventos o proyectos. Ejemplo: "vacaciones-2024", "renovacion-casa".',
        actionLabel: 'Crear mi primera etiqueta',
    },
};

// Sugerencias proactivas basadas en datos
export function getProactiveSuggestions(data: {
    totalGastos: number;
    totalIngresos: number;
    presupuestosCount: number;
    metasCount: number;
    categoriasCount: number;
    diasSinRegistro?: number;
}): string[] {
    const suggestions: string[] = [];

    if (data.presupuestosCount === 0 && data.totalGastos > 0) {
        suggestions.push('No tienes presupuestos creados. Crear uno te ayuda a controlar tus gastos por categoria.');
    }

    if (data.metasCount === 0) {
        suggestions.push('Aun no tienes metas de ahorro. Ponerte un objetivo te motiva a ahorrar consistentemente.');
    }

    if (data.totalIngresos > 0 && data.totalGastos > data.totalIngresos) {
        suggestions.push('Este mes estas gastando mas de lo que ganas. Revisa tus gastos para encontrar donde puedes recortar.');
    }

    if (data.totalIngresos > 0 && data.totalGastos > 0) {
        const tasaAhorro = ((data.totalIngresos - data.totalGastos) / data.totalIngresos) * 100;
        if (tasaAhorro > 0 && tasaAhorro < 10) {
            suggestions.push('Tu tasa de ahorro es menor al 10%. Los expertos recomiendan ahorrar al menos el 20% de tus ingresos.');
        }
        if (tasaAhorro >= 20) {
            suggestions.push('Excelente! Estas ahorrando mas del 20% de tus ingresos. Considera invertir o crear una meta para ese ahorro.');
        }
    }

    if (data.diasSinRegistro && data.diasSinRegistro > 3) {
        suggestions.push(`Llevas ${data.diasSinRegistro} dias sin registrar gastos. Mantener el registro al dia te da mejor visibilidad.`);
    }

    return suggestions;
}

// Resumen en lenguaje natural
export function getNaturalLanguageSummary(metrics: {
    totalIngresosDelMes: number;
    totalGastosDelMes: number;
    balanceDelMes: number;
    cambioMesAnterior: number;
    top5Categorias: { nombre: string; total: number }[];
}): string {
    const parts: string[] = [];

    if (metrics.totalIngresosDelMes === 0 && metrics.totalGastosDelMes === 0) {
        return 'Aun no tienes movimientos este mes. Empieza registrando tus ingresos y gastos para ver tu resumen aqui.';
    }

    parts.push(`Este mes ingresaste $${metrics.totalIngresosDelMes.toFixed(2)} y gastaste $${metrics.totalGastosDelMes.toFixed(2)}.`);

    if (metrics.balanceDelMes > 0) {
        parts.push(`Tu balance es positivo: estas ahorrando $${metrics.balanceDelMes.toFixed(2)}.`);
    } else if (metrics.balanceDelMes < 0) {
        parts.push(`Atencion: estas gastando $${Math.abs(metrics.balanceDelMes).toFixed(2)} mas de lo que ganas.`);
    } else {
        parts.push('Tus gastos e ingresos estan parejos este mes.');
    }

    if (metrics.cambioMesAnterior !== 0) {
        if (metrics.cambioMesAnterior > 0) {
            parts.push(`Comparado con el mes pasado, tus gastos subieron un ${metrics.cambioMesAnterior.toFixed(1)}%.`);
        } else {
            parts.push(`Comparado con el mes pasado, tus gastos bajaron un ${Math.abs(metrics.cambioMesAnterior).toFixed(1)}%. Buen trabajo!`);
        }
    }

    if (metrics.top5Categorias.length > 0) {
        const topCat = metrics.top5Categorias[0];
        parts.push(`Tu mayor gasto fue en ${topCat.nombre} ($${topCat.total.toFixed(2)}).`);
    }

    return parts.join(' ');
}

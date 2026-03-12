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
            'El balance es la diferencia entre tus ingresos y gastos del mes',
            'El porcentaje "vs Mes Anterior" compara tus gastos con el mes pasado',
            'El grafico de tendencia te muestra como han cambiado tus finanzas en los ultimos 6 meses',
            'Las categorias del mes te muestran en que gastas mas dinero',
        ],
    },
    gastos: {
        title: 'Registro de Gastos',
        description: 'Aqui llevas el control de todo lo que gastas. Registra cada gasto con su monto, categoria y fecha para tener visibilidad de tu dinero.',
        tips: [
            'Un gasto "Fijo" es algo que pagas siempre (renta, internet). "Variable" es algo que cambia (comida, entretenimiento)',
            'Usa las categorias para organizar tus gastos y ver patrones',
            'Puedes usar los filtros avanzados para buscar gastos por fecha o rango de monto',
        ],
    },
    ingresos: {
        title: 'Registro de Ingresos',
        description: 'Aqui registras todo el dinero que recibes: salario, freelance, ventas, etc. Esto te ayuda a saber cuanto dinero entra cada mes.',
        tips: [
            'Registra todos tus ingresos, no solo el salario',
            'Categorizar tus ingresos te ayuda a diversificar tus fuentes de ingreso',
            'Compara tus ingresos vs gastos en el Dashboard para ver si estas ahorrando',
        ],
    },
    presupuestos: {
        title: 'Control de Presupuestos',
        description: 'Un presupuesto es un limite que te pones para no gastar de mas en una categoria. Por ejemplo: "No gastar mas de $3,000 en comida este mes".',
        tips: [
            'Verde = vas bien, Naranja = cuidado (mas del 80%), Rojo = excediste el limite',
            'Empieza con las categorias donde mas gastas',
            'Revisa tus presupuestos cada semana para ajustar tus habitos a tiempo',
        ],
    },
    metas: {
        title: 'Metas de Ahorro',
        description: 'Una meta es un objetivo financiero que quieres alcanzar. Define cuanto necesitas y ve abonando poco a poco hasta lograrlo.',
        tips: [
            'Ponle un nombre motivador a tu meta (ej: "Vacaciones en la playa")',
            'Abona regularmente aunque sea poco, la constancia es clave',
            'La barra de progreso te muestra que tan cerca estas de lograrlo',
        ],
    },
    cuentas: {
        title: 'Tus Cuentas',
        description: 'Aqui gestionas tus cuentas de dinero: efectivo, banco, tarjeta, ahorro, etc. Cada cuenta lleva su propio balance.',
        tips: [
            'Crea una cuenta por cada lugar donde tengas dinero',
            'El balance se actualiza automaticamente al registrar gastos e ingresos',
            'Puedes transferir dinero entre cuentas desde la seccion "Transferir"',
        ],
    },
    categorias: {
        title: 'Categorias',
        description: 'Las categorias te ayudan a clasificar tus gastos e ingresos. Por ejemplo: Alimentacion, Transporte, Salario, etc.',
        tips: [
            'Crea categorias que tengan sentido para ti',
            'Hay dos tipos: "Gasto" para lo que gastas e "Ingreso" para lo que recibes',
            'No crees demasiadas categorias, entre 5 y 10 por tipo es suficiente',
        ],
    },
    transferencias: {
        title: 'Transferencias',
        description: 'Mueve dinero entre tus propias cuentas. Por ejemplo: pasar dinero de tu cuenta de banco a tu cuenta de ahorro.',
        tips: [
            'Una transferencia no es un gasto ni un ingreso, es solo mover dinero entre cuentas',
            'Selecciona cuenta origen y destino y el monto a transferir',
        ],
    },
    gastosRecurrentes: {
        title: 'Gastos Recurrentes',
        description: 'Son gastos que se repiten automaticamente cada cierto tiempo: renta mensual, suscripciones, servicios, etc.',
        tips: [
            'Configura tus gastos fijos aqui para no olvidar registrarlos',
            'El sistema te recordara cuando se acerque la fecha de pago',
            'Puedes activar o desactivar un gasto recurrente sin eliminarlo',
        ],
    },
    ingresosRecurrentes: {
        title: 'Ingresos Recurrentes',
        description: 'Son ingresos que recibes regularmente: salario quincenal, renta de propiedad, pension, etc.',
        tips: [
            'Registra tu salario y otros ingresos fijos aqui',
            'Esto ayuda al sistema a proyectar tu flujo de caja futuro',
        ],
    },
    reportes: {
        title: 'Reportes Financieros',
        description: 'Aqui puedes ver graficos detallados de tus finanzas: tendencias, comparaciones entre meses y tus categorias principales.',
        tips: [
            'Usa los reportes para identificar patrones en tus gastos',
            'Compara diferentes meses para ver si estas mejorando',
            'Puedes exportar tus datos a Excel o PDF',
        ],
    },
    tags: {
        title: 'Etiquetas (Tags)',
        description: 'Los tags son etiquetas extra que puedes poner a tus gastos e ingresos para organizarlos mejor. Por ejemplo: "vacaciones", "trabajo", "emergencia".',
        tips: [
            'Usa tags para agrupar transacciones que pertenecen a un mismo evento o proyecto',
            'Un gasto puede tener varios tags a la vez',
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
    top5Categorias: { categoria: string; total: number }[];
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
        parts.push(`Tu mayor gasto fue en ${topCat.categoria} ($${topCat.total.toFixed(2)}).`);
    }

    return parts.join(' ');
}

/*
=========================================
Stat Card Component
-----------------------------------------
Purpose:
Reusable dashboard statistic card.

Props:
title
value
icon
=========================================
*/

// ============================
// Component
// ============================

function StatCard({

  title,

  value,

  icon: Icon,

}) {

  return (

    <div
      className="
        bg-white
        dark:bg-slate-900
        border
        border-slate-200
        dark:border-slate-800

        rounded-2xl

        p-6

        hover:border-cyan-500
        hover:-translate-y-1

        transition-all
        duration-300
      "
    >

      <div className="flex justify-between items-start">

        <div>

          <p className="text-slate-500 dark:text-slate-400" style={{ lineHeight: 1.4, letterSpacing: 0 }}>

            {title}

          </p>

          <h2 className="text-4xl font-bold mt-2 text-slate-900 dark:text-white" style={{ lineHeight: 1, letterSpacing: 0 }}>

            {value}

          </h2>

        </div>

        <div
          className="
            bg-cyan-500/10
            p-4
            rounded-xl
            text-cyan-400
            flex-shrink-0
          "
          style={{ lineHeight: 1 }}
        >

          <Icon size={28} />

        </div>

      </div>

    </div>

  );

}

export default StatCard;
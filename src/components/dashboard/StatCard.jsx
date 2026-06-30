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
        bg-slate-900
        border
        border-slate-800

        rounded-2xl

        p-6

        hover:border-cyan-500
        hover:-translate-y-1

        transition-all
        duration-300
      "
    >

      <div className="flex justify-between items-center">

        <div>

          <p className="text-slate-400">

            {title}

          </p>

          <h2 className="text-4xl font-bold mt-2">

            {value}

          </h2>

        </div>

        <div
          className="
            bg-cyan-500/10

            p-4

            rounded-xl

            text-cyan-400
          "
        >

          <Icon size={28} />

        </div>

      </div>

    </div>

  );

}

export default StatCard;
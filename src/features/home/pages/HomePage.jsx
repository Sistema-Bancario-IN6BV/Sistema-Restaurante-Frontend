import { Link } from "react-router-dom";
import { Restaurants } from "../../restaurants/components/Restaurants";

export const HomePage = () => {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <section className="mb-6">
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="text-sm text-text-muted mt-2">Encuentra restaurantes, reserva mesas y ordena en línea.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Restaurantes</h2>
        <Restaurants />
        <div className="mt-4">
          <Link to="/customer/restaurants" className="text-accent font-semibold">Ver todos los restaurantes</Link>
        </div>
      </section>
    </main>
  );
};

export default HomePage;

import React from 'react';
import classes from '../ProductData/ProductData.module.css';
import irishflower from '../../assets/plantimages/succulent/Irishflower.jpg';
import bluechalksticks from '../../assets/plantimages/succulent/bluechalksticks.jpg';
import coppersedum from '../../assets/plantimages/succulent/coppersedum.jpg';
import gollumjade from '../../assets/plantimages/succulent/gollumjade.jpg';
import haworthiafasciata from '../../assets/plantimages/succulent/haworthiafasciata.jpg';
import sedum from '../../assets/plantimages/succulent/sedum.jpg';
import auroraborealis from '../../assets/plantimages/succulent/auroraborealis.jpg';
import pencilcactus from '../../assets/plantimages/succulent/pencilcactus.jpg';
import spooncactus from '../../assets/plantimages/succulent/spooncactus.jpg';
import kalanchoemarmorata from '../../assets/plantimages/succulent/kalanchoemarmorata.jpg';
import kleidostylis from '../../assets/plantimages/succulent/kleidostylis.jpg';
import lawyerstongue from '../../assets/plantimages/succulent/lawyerstongue.jpg';
import paddleplant from '../../assets/plantimages/succulent/paddleplant.jpg';
import thaiplant from '../../assets/plantimages/indoor/thaiplant.jpg';
import handingpothos from '../../assets/plantimages/indoor/handingpothos.jpg';
import bamboo from '../../assets/plantimages/indoor/bamboo.jpg';
import snakeplant from '../../assets/plantimages/indoor/snakeplant.jpg';
import dracaenadragon from '../../assets/plantimages/indoor/dracaenadragon.jpg';
import lemoncypress from '../../assets/plantimages/indoor/lemoncypress.jpg';
import sansevieria from '../../assets/plantimages/indoor/sansevieria.jpg';
import schefflera from '../../assets/plantimages/indoor/schefflera.jpg';
import rosemary from '../../assets/plantimages/outdoor/rosemary.jpg';
import basil from '../../assets/plantimages/outdoor/basil.jpg';
import williamsplant from '../../assets/plantimages/outdoor/williamsplant.jpg';
import sanguinaria from '../../assets/plantimages/outdoor/sanguinaria.jpg';
import pansy from '../../assets/plantimages/outdoor/pansy.jpg';
import marjoram from '../../assets/plantimages/outdoor/marjoram.jpg';
import periwinkle from '../../assets/plantimages/outdoor/periwinkle.jpg';
import mint from '../../assets/plantimages/outdoor/mint.jpg';
import rose from '../../assets/plantimages/outdoor/rose.jpg';

export const getProducts = () => {
  const products = [
    {
      id: 'irishflower',
      name: 'Irish Flower',
      category: 'Succulent',
      price: 35,
      description: '',
      stock: 10,
      image: irishflower,
    },
    {
      id: 'bluechalksticks',
      name: 'Bluechalk Sticks',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: bluechalksticks,
    },
    {
      id: 'coppersedum',
      name: 'Copper Sedum',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: coppersedum,
    },
    {
      id: 'gollumjade',
      name: 'Gollum Jade',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: gollumjade,
    },
    {
      id: 'haworthiafasciata',
      name: 'Haworthia Fasciata',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: haworthiafasciata,
    },
    {
      id: 'sedum',
      name: 'Sedum',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: sedum,
    },
    {
      id: 'auroraborealis',
      name: 'Aurora Borealis',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: auroraborealis,
    },
    {
      id: 'pencilcactus',
      name: 'Pencil Cactus',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: pencilcactus,
    },
    {
      id: 'spooncactus',
      name: 'Spoon Cactus',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: spooncactus,
    },
    {
      id: 'kalanchoemarmorata',
      name: 'Kalanchoe Marmorata',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: kalanchoemarmorata,
    },
    {
      id: 'kleidostylis',
      name: 'Kleidostylis',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: kleidostylis,
    },
    {
      id: 'lawyerstongue',
      name: "Lawyer's Tongue",
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: lawyerstongue,
    },
    {
      id: 'paddleplant',
      name: 'Paddle Plant',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: paddleplant,
    },
    {
      id: 'thaiplant',
      name: 'Thai Plant',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: thaiplant,
    },
    {
      id: 'handingpothos',
      name: 'Handing Pothos',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: handingpothos,
    },
    {
      id: 'bamboo',
      name: 'Bamboo',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: bamboo,
    },
    {
      id: 'snakeplant',
      name: 'Snake Plant',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: snakeplant,
    },
    {
      id: 'dracaenadragon',
      name: 'Dracaena Dragon',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: dracaenadragon,
    },
    {
      id: 'lemoncypress',
      name: 'Lemon Cypress',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: lemoncypress,
    },
    {
      id: 'sansevieria',
      name: 'Sansevieria',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: sansevieria,
    },
    {
      id: 'schefflera',
      name: 'Schefflera',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: schefflera,
    },
    {
      id: 'rosemary',
      name: 'Rosemary',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: rosemary,
    },
    {
      id: 'basil',
      name: 'Basil',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: basil,
    },
    {
      id: 'williamsplant',
      name: "William's Plant",
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: williamsplant,
    },
    {
      id: 'sanguinaria',
      name: 'Sanguinaria',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: sanguinaria,
    },
    {
      id: 'pansy',
      name: 'Pansy',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: pansy,
    },
    {
      id: 'marjoram',
      name: 'Marjoram',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: marjoram,
    },
    {
      id: 'periwinkle',
      name: 'Periwinkle',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: periwinkle,
    },
    {
      id: 'mint',
      name: 'Mint',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: mint,
    },
    {
      id: 'rose',
      name: 'Rose',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: rose,
    },
  ];

  const featuredProducts = [
    {
      id: 'bluechalksticks',
      name: 'Bluechalk Sticks',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: bluechalksticks,
    },
    {
      id: 'coppersedum',
      name: 'Copper Sedum',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: coppersedum,
    },
    {
      id: 'bamboo',
      name: 'Bamboo',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: bamboo,
    },
    {
      id: 'snakeplant',
      name: 'Snake Plant',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: snakeplant,
    },
    {
      id: 'marjoram',
      name: 'Marjoram',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: marjoram,
    },
    {
      id: 'periwinkle',
      name: 'Periwinkle',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: periwinkle,
    },
    {
      id: 'mint',
      name: 'Mint',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: mint,
    },
  ];

  const recentProducts = [
    {
      id: 'haworthiafasciata',
      name: 'Haworthia Fasciata',
      category: 'Succulent',
      price: 45,
      description: '',
      stock: 10,
      image: haworthiafasciata,
    },
    {
      id: 'snakeplant',
      name: 'Snake Plant',
      category: 'Indoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: snakeplant,
    },
    {
      id: 'periwinkle',
      name: 'Periwinkle',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: periwinkle,
    },
    {
      id: 'mint',
      name: 'Mint',
      category: 'Outdoor Plants',
      price: 45,
      description: '',
      stock: 10,
      image: mint,
    },
  ];

  // Function to get product by ID
  const getProductById = (id) => {
    return products.find((product) => product.id === id) || null;
  };

  return { products, featuredProducts, recentProducts, getProductById };
};

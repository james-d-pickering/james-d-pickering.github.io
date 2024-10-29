#!/usr/bin/env python
# coding: utf-8

# In[40]:


import numpy as np
import scipy as sp
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit
from scipy import special

#JDP the function for power transmitted by the knife edge. The complementary error function, from integrating the Gaussian in 2D.
def knife_edge_func(x, x0, w,c):
    var = (x-x0)*np.sqrt(2)/w
    func = 0.5 * sp.special.erfc(var)+ c
    return func

#####################
#JDP data being added - could do this from a file but brute force works
#####################
#JDP IR beam horizontal
beam_x = np.array([9, 8.75, 8.5, 8.25, 8, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.75, 6.7, 6.6, 6.5, 6.4, 6.3, 6.25, 6.2, 6.1, 6.0, 5.75, 5.5, 5.25, 5, 4.75, 4.5])
beam_sig = np.array([2.23, 2.21, 2.17, 2.14, 2.08, 2.04, 2.00, 1.97, 1.93, 1.89, 1.82, 1.76, 1.66, 1.58, 1.47, 1.34, 1.21, 1.19, 1.08, 0.95, 0.84, 0.72, 0.61, 0.57, 0.50, 0.40, 0.33, 0.19, 0.10, 0.10, 0.10, 0.10,0.10])

#JDP IR beam vertical
#beam_x = np.arange(2.0,8.1,0.1)
#beam_sig = np.array([2.2, 2.2, 2.2, 2.17, 2.19, 2.18, 2.2, 2.18, 2.18, 2.19, 2.19, 2.2, 2.2, 2.2, 2.18, 2.18, 2.18, 2.17, 2.19, 2.15, 2.15, 2.16, 2.19, 2.17, 2.16, 2.15, 2.15, 2.13, 2.11, 2.09, 2.06, 1.97, 1.93, 1.89, 1.80, 1.70, 1.62, 1.55, 1.47, 1.41, 1.30, 1.21, 1.11, 1.01, 0.90, 0.81, 0.72, 0.63, 0.56, 0.48, 0.41, 0.35, 0.30, 0.26, 0.23, 0.20, 0.19, 0.19, 0.19, 0.18, 0.18])

#JDP vis beam horizontal
#beam_x = np.arange(0, 7.2, 0.2)
#beam_sig = np.array([0,0,0,0,0,0,0,0,0,8,12,16,22,27,34,40,45,50,56,60,65,68,71,75,77,80,82,84,85,85,86,86,85,86,86,86])

#JDP vis beam vertical
#beam_x = np.arange(1.5, 8.1, 0.1)
#beam_sig = np.array([87,85,87,85,87,86,87,86,86,86,86,85,85,86,84,85,84,83,83,83,81,81,80,79,78,77,75,74,73,71,70,68,67,64,62,59,58,56,53,51,49,46,44,42,40,37,35,33,31,29,27,25,25,21,19,17,15,14,12,11,9,8,7,6,6,6])



################
#JDP program starts here
################

#JDP flip the signal array if its not in descending order
if beam_sig[0] < beam_sig[np.size(beam_sig)-1]:
    beam_sig = np.flipud(beam_sig)
    
#JDP normalise the signal so it starts at 1 for the fit (dividing by max power)
beam_sig = beam_sig/np.max(beam_sig)

#JDP remove the offset from the x axis so that it starts nearer to where the fit starts looking 
beam_x_range = 0.5*(np.max(beam_x) - np.min(beam_x))
beam_x = beam_x - beam_x_range

#JDP do the actual curve fit                                              
fit_params, fit_cov = curve_fit(knife_edge_func, beam_x, beam_sig)                       

#JDP send the fitted parameters back to generate the fitted curve
fit = knife_edge_func(beam_x, *fit_params)

#JDP plot the fit so you can see how good it is
plt.figure()
plt.plot(beam_x, beam_sig)
plt.plot(beam_x, fit)

#JDP printing values. Take the abs because the sign of the radius will change depending on the ordering of the x axis. Assumes the steps are in mm.
print("Fitted 1/e$^2$ radius is", np.abs(fit_params[1]), "mm")


# In[28]:


test = np.arange(2.0, 8.1, 0.1)
print(test)


# In[ ]:





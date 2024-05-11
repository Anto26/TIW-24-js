package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.context.WebContext;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Comment;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.dao.ImageDAO;
import it.polimi.tiw.servlets.DataServlet;
import it.polimi.tiw.utils.GeneralUtility;
import it.polimi.tiw.utils.JsonUtility;
import it.polimi.tiw.utils.Pair;

@WebServlet("/getUserImages")
public class GetUserImagesServlet extends ApiServlet {
    private static final long serialVersionUID = -7291515526960117146L;
    private Gson gson = new Gson();
    
	public GetUserImagesServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");
		try {
			ImageDAO imageDAO = new ImageDAO(this.dbConnection);
			
			List<Image> imgs = imageDAO.getPersonImages(user);
			this.goodRequestResponse(response, JsonUtility.mapToJson(imgs));
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			e.printStackTrace();
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}

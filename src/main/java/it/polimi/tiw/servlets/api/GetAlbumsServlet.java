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
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.servlets.DataServlet;
import it.polimi.tiw.utils.JsonUtility;
import it.polimi.tiw.utils.Pair;

@WebServlet("/getAlbums")
public class GetAlbumsServlet extends ApiServlet {
    private static final long serialVersionUID = -7297515526960117146L;
    private AlbumDAO albumDAO;
    
	public GetAlbumsServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		try {
			albumDAO = new AlbumDAO(this.dbConnection);
			LinkedHashMap<Album, Pair<Person, Image>> albums = albumDAO.getAlbumThumbnailAndPersonMap();
			JsonArray result = JsonUtility.getAlbumsJsonObject(albums);
			this.goodRequestResponse(response, result);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
	
	public void destroy() {
		super.destroy();
		try {
			if (this.albumDAO != null) {
				this.albumDAO.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
